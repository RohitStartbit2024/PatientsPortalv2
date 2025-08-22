using System;
using System.Security.Cryptography;

namespace PatientsPortal.Services
{
    public static class RefreshTokenGenerator
    {
        public static string GenerateToken(int size = 64)
        {
            var randomNumber = new byte[size];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
