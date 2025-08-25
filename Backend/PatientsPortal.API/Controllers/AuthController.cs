using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtpNet;
using PatientsPortal.DataAccess;
using PatientsPortal.Models.DbModels.User;
using PatientsPortal.Models.DTOs;
using PatientsPortal.Services;
using QRCoder;
using System.Drawing;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;


namespace PatientsPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthController(AppDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpPost("register/admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterDto dto)
        {
            return await RegisterUser(dto, "Admin");
        }

        [HttpPost("register/patient")]
        public async Task<IActionResult> RegisterPatient([FromBody] RegisterDto dto)
        {
            return await RegisterUser(dto, "Patient");
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginStep1([FromBody] LoginStep1Dto dto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null || user.IsDeleted == true)
                return Unauthorized("Invalid email or password");

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Invalid email or password");

            if (user.IsMfaEnabled)
            {
                return Ok(new MfaRequiredResponseDto
                {
                    Email = user.Email,
                    Message = "MFA required", 
                    MfaSetup = true
                });
            }
            else
            {
                return Ok(new MfaRequiredResponseDto
                {
                    Email = user.Email,
                    Message = "MFA required",
                    MfaSetup = false
                });
            }
        }

        [HttpPost("login/mfa")]
        public async Task<IActionResult> LoginStep2([FromBody] LoginStep2Dto dto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null || !user.IsMfaEnabled || string.IsNullOrEmpty(user.MfaSecret))
                return Unauthorized("Invalid MFA attempt");

            var totp = new Totp(Base32Encoding.ToBytes(user.MfaSecret));
            bool isValid = totp.VerifyTotp(dto.TotpCode, out long timeStepMatched, new VerificationWindow(2, 2));

            if (!isValid)
                return Unauthorized("Invalid MFA code");

            var token = _jwtService.GenerateToken(user.Id.ToString(), user.Role.Name, user.Email);
            var refreshToken = await GenerateAndSaveRefreshToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                Email = user.Email,
                Role = user.Role.Name,
                FirstName = user.FirstName,
                LastName = user.LastName
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto dto)
        {
            var tokenHash = ComputeSha256Hash(dto.Token);
            var refreshToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow);

            if (refreshToken == null)
                return Unauthorized("Invalid or expired refresh token");

            refreshToken.RevokedAt = DateTime.UtcNow;

            var newJwt = _jwtService.GenerateToken(
                refreshToken.User.Id.ToString(),
                refreshToken.User.Role.Name,
                refreshToken.User.Email
            );

            var newRefreshToken = await GenerateAndSaveRefreshToken(refreshToken.User, refreshToken);

            await _context.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                Token = newJwt,
                RefreshToken = newRefreshToken,
                Email = refreshToken.User.Email,
                Role = refreshToken.User.Role.Name,
                FirstName = refreshToken.User.FirstName,
                LastName = refreshToken.User.LastName
            });
        }


        [HttpPost("mfa/setup")]
        public async Task<IActionResult> EnableMfa([FromBody] EnableMfaRequestDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (user == null)
                return NotFound("User not found");

            if (user.IsMfaEnabled)
                return BadRequest("MFA is already enabled for this user");

            var secretKey = KeyGeneration.GenerateRandomKey(20);
            var secretBase32 = Base32Encoding.ToString(secretKey);

            user.MfaSecret = secretBase32;
            await _context.SaveChangesAsync();

            var issuer = "PatientsPortal";
            var label = user.Email;
            var otpAuthUri = new OtpUri(OtpType.Totp, secretBase32, label, issuer).ToString();

            using var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(otpAuthUri, QRCodeGenerator.ECCLevel.Q);
            var qrCode = new Base64QRCode(qrCodeData);
            var qrCodeBase64 = qrCode.GetGraphic(20); 
            return Ok(new MfaSetupResponseDto
            {
                Email = user.Email,
                MfaSecret = secretBase32,
                QrCodeBase64 = qrCodeBase64
            });
        }


        // -------------------------
        // Step 2: Verify MFA code to enable
        // -------------------------
        [HttpPost("mfa/verify")]
        public async Task<IActionResult> VerifyMfaSetup([FromBody] VerifyMfaSetupDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (user == null || string.IsNullOrEmpty(user.MfaSecret))
                return NotFound("User or MFA secret not found");

            var totp = new Totp(Base32Encoding.ToBytes(user.MfaSecret));
            bool isValid = totp.VerifyTotp(dto.TotpCode, out long timeStepMatched, new VerificationWindow(2, 2));

            if (!isValid)
                return BadRequest("Invalid MFA code");

            user.IsMfaEnabled = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "MFA enabled successfully" });
        }

        [HttpPost("validate-refresh")]
        public async Task<IActionResult> ValidateRefreshToken([FromBody] RefreshTokenRequestDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null)
                return Unauthorized("User not found");

            // hash the incoming refresh token
            var tokenHash = ComputeSha256Hash(dto.Token);

            // find active refresh token for this user
            var refreshToken = user.RefreshTokens
                .FirstOrDefault(rt => rt.TokenHash == tokenHash && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow);

            if (refreshToken == null)
                return Unauthorized("Invalid or expired refresh token");

            // ✅ valid token → return role + basic user info
            return Ok(new
            {
                Valid = true,
                Email = user.Email,
                Role = user.Role.Name,
                FirstName = user.FirstName,
                LastName = user.LastName
            });
        }

        [HttpPost("verify")]
        [Authorize]
        public IActionResult Verify()
        {
            // check which claim names are actually present
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();

            var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("userId")?.Value;

            var role = User.FindFirst(ClaimTypes.Role)?.Value
                       ?? User.FindFirst("role")?.Value;

            return Ok(new
            {
                message = "Token is valid",
                userId,
                role,
                claims // debug: returns all claims so you can see names
            });
        }

        #region Private Methods
        private async Task<IActionResult> RegisterUser(RegisterDto dto, string roleName)
        {
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                return BadRequest("Email already registered");

            var role = await _context.UserRoles.FirstOrDefaultAsync(r => r.Name == roleName);
            if (role == null)
                return BadRequest($"Role '{roleName}' not found. Seed roles first.");

            var user = new User
            {
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                PhoneNumber = dto.PhoneNumber,
                RoleId = role.Id,
                CreatedAt = DateTime.UtcNow
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user.Id.ToString(), role.Name, user.Email);
            var refreshToken = await GenerateAndSaveRefreshToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                Email = user.Email,
                Role = role.Name,
                FirstName = user.FirstName,
                LastName = user.LastName
            });
        }

        private async Task<string> GenerateAndSaveRefreshToken(User user, RefreshToken? oldToken = null)
        {
            var refreshTokenValue = RefreshTokenGenerator.GenerateToken();
            var refreshTokenHash = ComputeSha256Hash(refreshTokenValue);

            var token = new RefreshToken
            {
                TokenHash = refreshTokenHash,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                CreatedAt = DateTime.UtcNow,
                ReplacedByHash = oldToken?.TokenHash
            };

            _context.RefreshTokens.Add(token);
            await _context.SaveChangesAsync();

            return refreshTokenValue;
        }

        private string ComputeSha256Hash(string rawData)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            return BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }
        #endregion
    }
}