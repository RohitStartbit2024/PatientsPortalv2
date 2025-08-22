using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientsPortal.Models.DTOs
{
    public class RegisterDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? PhoneNumber { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
    public class LoginStep1Dto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class LoginStep2Dto
    {
        public string Email { get; set; } = null!;
        public string TotpCode { get; set; } = null!;
    }

    public class MfaRequiredResponseDto
    {
        public string Message { get; set; } = "MFA required";
        public bool MfaSetup { get; set; }
        public string Email { get; set; } = null!;
    }
    public class RefreshTokenRequestDto
    {

        public string? Email { get; set; }
        public string Token { get; set; } = null!;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
    }

}
