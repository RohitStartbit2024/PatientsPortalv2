using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientsPortal.Models.DTOs
{
    public class PatientReportDTO
    {
        public int Id { get; set; }
        public string? ReportTitle { get; set; }
        public string? ReportDescription { get; set; }
        public DateTime UploadTime { get; set; }
    }
}
