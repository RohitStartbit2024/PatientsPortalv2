using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientsPortal.Models.DbModels.User
{
    public class RefreshToken
    {
        public int Id { get; set; }  // PK
        public string TokenHash { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedByIp { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? ReplacedByHash { get; set; }

        // FK → User
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
