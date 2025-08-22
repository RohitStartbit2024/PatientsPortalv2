using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientsPortal.Common.Security
{
    public static class PasswordHelper
    {
        private static readonly PasswordHasher<object> _hasher = new PasswordHasher<object>();

        /// <summary>
        /// Hash a plain text password securely.
        /// </summary>
        public static string HashPassword(string password)
        {
            return _hasher.HashPassword(null!, password);
        }

        /// <summary>
        /// Verify a plain text password against a hash.
        /// </summary>
        public static bool VerifyPassword(string hashedPassword, string password)
        {
            var result = _hasher.VerifyHashedPassword(null!, hashedPassword, password);
            return result == PasswordVerificationResult.Success;
        }
    }
}
