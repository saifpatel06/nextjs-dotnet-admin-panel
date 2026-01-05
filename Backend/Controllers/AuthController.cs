using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AdminPanelAPI.Data;
using AdminPanelAPI.DTOs;
using AdminPanelAPI.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AdminPanelAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<UserResponseDto>>> Register(RegisterDto registerDto)
        {
            try
            {
                var existingAdmin = await _context.Admins
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == registerDto.Email.ToLower());

                if (existingAdmin != null)
                {
                    return BadRequest(new ApiResponse<UserResponseDto>
                    {
                        Success = false,
                        Message = "Email already registered"
                    });
                }

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

                var admin = new Admin
                {
                    Name = registerDto.Name,
                    Email = registerDto.Email.ToLower(),
                    PasswordHash = passwordHash,
                    Role = "Admin",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                var userResponse = new UserResponseDto
                {
                    Id = admin.Id,
                    Name = admin.Name,
                    Email = admin.Email,
                    Role = admin.Role,
                    Status = admin.Status,
                    CreatedAt = admin.CreatedAt,
                    Token = GenerateJwtToken(admin) // Optional: Generate token on registration too
                };

                return CreatedAtAction(nameof(Register), new ApiResponse<UserResponseDto>
                {
                    Success = true,
                    Message = "Admin registered successfully",
                    Data = userResponse
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<UserResponseDto> { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<UserResponseDto>>> Login(LoginDto loginDto)
        {
            try
            {
                var admin = await _context.Admins
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

                if (admin == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, admin.PasswordHash))
                {
                    return Unauthorized(new ApiResponse<UserResponseDto>
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    });
                }

                // Generate the JWT Token
                var token = GenerateJwtToken(admin);

                var userResponse = new UserResponseDto
                {
                    Id = admin.Id,
                    Name = admin.Name,
                    Email = admin.Email,
                    Role = admin.Role,
                    Status = admin.Status,
                    CreatedAt = admin.CreatedAt,
                    Token = token 
                };

                return Ok(new ApiResponse<UserResponseDto>
                {
                    Success = true,
                    Message = "Login successful",
                    Data = userResponse
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<UserResponseDto> { Success = false, Message = ex.Message });
            }
        }

        // Helper Method to generate the JWT
        private string GenerateJwtToken(Admin admin)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? ""; 
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, admin.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
                new Claim(ClaimTypes.Role, admin.Role),
                new Claim("Name", admin.Name)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7), 
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}