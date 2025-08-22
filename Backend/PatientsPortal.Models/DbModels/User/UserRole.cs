using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientsPortal.Models.DbModels.User
{
    public class UserRole
    {
        public int Id { get; set; }  // PK
        public string Name { get; set; } = null!; // "Admin", "Patient", etc.

        // Navigation
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
