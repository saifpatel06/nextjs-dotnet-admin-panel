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
                // Check if email already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == registerDto.Email.ToLower());

                if (existingUser != null)
                {
                    return BadRequest(new ApiResponse<UserResponseDto>
                    {
                        Success = false,
                        Message = "Email already registered",
                        Errors = new List<string> { "A user with this email already exists" }
                    });
                }

                // Hash the password
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

                // Create new user
                var user = new User
                {
                    Name = registerDto.Name,
                    Email = registerDto.Email.ToLower(),
                    PasswordHash = passwordHash,
                    Role = "User",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Return user response (without password)
                var userResponse = new UserResponseDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    Status = user.Status,
                    CreatedAt = user.CreatedAt
                };

                return CreatedAtAction(nameof(Register), new ApiResponse<UserResponseDto>
                {
                    Success = true,
                    Message = "User registered successfully",
                    Data = userResponse
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<UserResponseDto>
                {
                    Success = false,
                    Message = "An error occurred while registering user",
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
                // 1. Find user by email
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

                // 2. Check if user exists and verify password
                // BCrypt.Verify compares the plain text password with the stored hash
                if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                {
                    return Unauthorized(new ApiResponse<UserResponseDto>
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    });
                }

                // 3. Map to Response DTO
                var userResponse = new UserResponseDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    Status = user.Status,
                    CreatedAt = user.CreatedAt
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

        // GET: api/Auth/users (Get all users for testing)
        [HttpGet("users")]
        public async Task<ActionResult<ApiResponse<List<UserResponseDto>>>> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new UserResponseDto
                    {
                        Id = u.Id,
                        Name = u.Name,
                        Email = u.Email,
                        Role = u.Role,
                        Status = u.Status,
                        CreatedAt = u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new ApiResponse<List<UserResponseDto>>
                {
                    Success = true,
                    Message = "Users retrieved successfully",
                    Data = users
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<UserResponseDto>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving users",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}