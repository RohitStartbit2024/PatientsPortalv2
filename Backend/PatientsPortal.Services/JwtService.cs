using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PatientsPortal.Services
{
    public class JwtService
    {
        private readonly string _secret;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly double _defaultExpiryMinutes;

        public JwtService(IConfiguration config)
        {
            // Read all JWT settings from configuration
            _secret = config["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key");
            _issuer = config["Jwt:Issuer"] ?? throw new ArgumentNullException("Jwt:Issuer");
            _audience = config["Jwt:Audience"] ?? throw new ArgumentNullException("Jwt:Audience");

            if (!double.TryParse(config["Jwt:ExpiryMinutes"], out _defaultExpiryMinutes))
            {
                _defaultExpiryMinutes = 60; // fallback default
            }
        }

        /// <summary>
        /// Generates a JWT token for a user.
        /// </summary>
        /// <param name="userId">User ID as string or GUID.</param>
        /// <param name="email">User email (optional but recommended).</param>
        /// <param name="role">User role.</param>
        /// <param name="expireMinutes">Custom expiration in minutes (optional).</param>
        /// <returns>JWT token as string.</returns>
        public string GenerateToken(string userId, string role, string? email = null, double? expireMinutes = null)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(ClaimTypes.Role, role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (!string.IsNullOrEmpty(email))
            {
                claims.Add(new Claim(JwtRegisteredClaimNames.Email, email));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenExpiry = DateTime.UtcNow.AddMinutes(expireMinutes ?? _defaultExpiryMinutes);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: tokenExpiry,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
