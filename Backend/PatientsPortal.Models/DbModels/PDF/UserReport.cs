using PatientsPortal.Models.DbModels.User;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientsPortal.Models.DbModels.PDF
{
    public class UserReport
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // Foreign key → Users(Id)
        [Required]
        public int PatientId { get; set; }

        [Required]
        public int UploadedBy { get; set; }

        [Required, MaxLength(200)]
        public string ReportTitle { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ReportDescription { get; set; }

        [Required]
        public DateTime UploadTime { get; set; } = DateTime.UtcNow;

        public DateTime? DownloadTime { get; set; }

        [Required]
        public byte[] ReportPdf { get; set; } = Array.Empty<byte>();

        [ForeignKey(nameof(UploadedBy))]
        virtual public PatientsPortal.Models.DbModels.User.User? UploadedByUser { get; set; }

        [ForeignKey(nameof(PatientId))]
        virtual public PatientsPortal.Models.DbModels.User.User? Patient { get; set; }
    }
}
