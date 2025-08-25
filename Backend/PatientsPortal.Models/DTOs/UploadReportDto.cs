using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;


namespace PatientsPortal.Models.DTOs
{
    public class UploadReportDto
    {
        public int PatientId { get; set; }
        public string ReportTitle { get; set; } = string.Empty;
        public string? ReportDescription { get; set; }

        // File will come as IFormFile
        public IFormFile? ReportPdf { get; set; }
    }
}
