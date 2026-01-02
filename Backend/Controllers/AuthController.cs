using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AdminPanelAPI.Data;
using AdminPanelAPI.DTOs;
using AdminPanelAPI.Models;

namespace AdminPanelAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<UserResponseDto>>> Register(RegisterDto registerDto)
        {
            try
            {
                // Check if email already exists in ADMINS table
                var existingAdmin = await _context.Admins
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == registerDto.Email.ToLower());

                if (existingAdmin != null)
                {
                    return BadRequest(new ApiResponse<UserResponseDto>
                    {
                        Success = false,
                        Message = "Email already registered",
                        Errors = new List<string> { "An admin with this email already exists" }
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

                // Saving to Admins table
                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                var userResponse = new UserResponseDto
                {
                    Id = admin.Id,
                    Name = admin.Name,
                    Email = admin.Email,
                    Role = admin.Role,
                    Status = admin.Status,
                    CreatedAt = admin.CreatedAt
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
                return StatusCode(500, new ApiResponse<UserResponseDto>
                {
                    Success = false,
                    Message = "An error occurred while registering admin",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<UserResponseDto>>> Login(LoginDto loginDto)
        {
            try
            {
                // Find admin in ADMINS table
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

                var userResponse = new UserResponseDto
                {
                    Id = admin.Id,
                    Name = admin.Name,
                    Email = admin.Email,
                    Role = admin.Role,
                    Status = admin.Status,
                    CreatedAt = admin.CreatedAt
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
                return StatusCode(500, new ApiResponse<UserResponseDto>
                {
                    Success = false,
                    Message = "An error occurred during login",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}