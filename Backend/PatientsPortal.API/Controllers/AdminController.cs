using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PatientsPortal.DataAccess;
using PatientsPortal.Models.DbModels.PDF;
using PatientsPortal.Models.DbModels.User;
using PatientsPortal.Models.DTOs;
using System.Security.Claims;

namespace PatientsPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all patients (Users where RoleType = "Patient")
        /// </summary>
        [HttpGet("patients-list")]
        public async Task<ActionResult<List<PatientDTO>>> GetPatients()
        {
            try
            {
                var patients = await _context.Users
                    .Include(u => u.Role)
                    .Where(u => u.Role != null
                                && u.Role.Name == "Patient"
                                && (u.IsDeleted == false || u.IsDeleted == null))
                    .Select(u => new PatientDTO
                    {
                        Id = u.Id,
                        Email = u.Email,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        PhoneNumber = u.PhoneNumber
                    })
                    .ToListAsync();

                if (patients == null || patients.Count == 0)
                {
                    return NotFound("No patients found.");
                }

                return Ok(patients);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching patients.",
                    details = ex.Message
                });
            }
        }

        [HttpPost("upload-report")]
        public async Task<IActionResult> UploadReport([FromForm] UploadReportDto dto)
        {
            if (dto.ReportPdf == null || dto.ReportPdf.Length == 0)
                return BadRequest("PDF file is required.");

            using var ms = new MemoryStream();
            await dto.ReportPdf.CopyToAsync(ms);
            var pdfBytes = ms.ToArray();

            // ✅ Now using ClaimTypes.NameIdentifier
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var uploaderId))
            {
                return Unauthorized(new { message = "Invalid or missing user ID in token." });
            }

            var report = new UserReport
            {
                PatientId = dto.PatientId,
                UploadedBy = uploaderId,
                ReportTitle = dto.ReportTitle,
                ReportDescription = dto.ReportDescription,
                ReportPdf = pdfBytes,
                UploadTime = DateTime.UtcNow
            };

            _context.UserReports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Report uploaded successfully", reportId = report.Id });
        }
    }
}
