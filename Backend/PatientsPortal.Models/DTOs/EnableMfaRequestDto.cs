using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientsPortal.Models.DTOs
{
    public class EnableMfaRequestDto
    {
        public string Email { get; set; } = null!;
    }

    public class VerifyMfaSetupDto
    {
        public string Email { get; set; } = null!;
        public string TotpCode { get; set; } = null!;
    }

    public class MfaSetupResponseDto
    {
        public string Email { get; set; } = null!;
        public string MfaSecret { get; set; } = null!;
        public string QrCodeBase64 { get; set; } = null!;
    }
}
