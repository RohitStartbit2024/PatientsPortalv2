using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientsPortal.Models.DbModels.User
{
    public class User
    {
        public int Id { get; set; }  // PK
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;

        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? PhoneNumber { get; set; }

        public bool IsMfaEnabled { get; set; } = false;
        public string? MfaSecret { get; set; } // For TOTP (encrypted or base32)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // FK → UserRole
        public int RoleId { get; set; }
        public UserRole Role { get; set; } = null!;

        // Navigation
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
