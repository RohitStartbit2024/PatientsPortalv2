using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Routing;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace PatientsPortal.Services
{
    public class PatientJwtHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public PatientJwtHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock)
            : base(options, logger, encoder, clock) { }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return AuthenticateResult.Fail("Missing or invalid Authorization header.");

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var handler = new JwtSecurityTokenHandler();
            JwtSecurityToken? jwt;

            try
            {
                jwt = handler.ReadJwtToken(token);
            }
            catch
            {
                return AuthenticateResult.Fail("Invalid JWT.");
            }

            var emailClaim = jwt.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Email || c.Type == ClaimTypes.Email);

            if (emailClaim == null)
                return AuthenticateResult.Fail("JWT does not contain email.");

            // ✅ Get email from route
            var routeData = Context.GetRouteData();
            var routeEmail = routeData.Values["email"]?.ToString();

            if (string.IsNullOrEmpty(routeEmail) || !string.Equals(routeEmail, emailClaim.Value, StringComparison.OrdinalIgnoreCase))
            {
                return AuthenticateResult.Fail("JWT email does not match requested resource.");
            }

            // ✅ Success
            var identity = new ClaimsIdentity(jwt.Claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
    }
}
