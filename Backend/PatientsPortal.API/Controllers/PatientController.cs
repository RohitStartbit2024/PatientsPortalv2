using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PatientsPortal.DataAccess;
using PatientsPortal.Models.DTOs;

namespace PatientsPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = "PatientJwt")]
    public class PatientController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PatientController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{email}/reports")]
        public async Task<ActionResult<IEnumerable<PatientReportDTO>>> GetPatientReports(string email)
        {

            // 1. Get patientId from Users table
            var patient = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (patient == null)
                return NotFound("Patient not found");

            // 2. Fetch reports for this patient
            var reports = await _context.UserReports
                .Where(r => r.PatientId == patient.Id)
                .OrderByDescending(r => r.UploadTime)
                .Select(r => new PatientReportDTO
                {
                    Id = r.Id,
                    ReportTitle = r.ReportTitle,
                    ReportDescription = r.ReportDescription,
                    UploadTime = r.UploadTime
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpGet("{email}/reports/{reportId}/download")]
        public async Task<IActionResult> DownloadReport(string email, int reportId)
        {
            // 1. Verify patient exists
            var patient = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (patient == null)
                return NotFound("Patient not found");

            // 2. Find the report
            var report = await _context.UserReports
                .FirstOrDefaultAsync(r => r.Id == reportId && r.PatientId == patient.Id);

            if (report == null)
                return NotFound("Report not found or not accessible");

            if (report.ReportPdf == null || report.ReportPdf.Length == 0)
                return BadRequest("Report PDF is missing");

            // 3. Update download time
            report.DownloadTime = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // 4. Set filename safely
            var fileName = report.ReportTitle + ".pdf";
            var contentDisposition = new System.Net.Mime.ContentDisposition
            {
                FileName = fileName,
                Inline = false // force download
            };
            Response.Headers.Add("Content-Disposition", contentDisposition.ToString());

            // 5. Return PDF
            return File(report.ReportPdf, "application/pdf");
        }


    }
}
