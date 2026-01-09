using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using AdminPanelAPI.Data; 
using AdminPanelAPI.Models;
using AdminPanelAPI.DTOs;

namespace AdminPanelAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BarbersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BarbersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Barbers
        [HttpGet]
        public async Task<IActionResult> GetBarbers()
        {
            var barbers = await _context.Barbers
                .Include(b => b.Availabilities) 
                .ToListAsync();

            var barberDtos = barbers.Select(b => new BarberDto
            {
                Id = b.Id,
                Name = b.Name,
                Role = b.Role,
                Phone = b.Phone,
                Email = b.Email,
                Specialization = b.Specialization,
                Bio = b.Bio,
                ImageUrl = b.ImageUrl,
                IsActive = b.IsActive,
                Rating = b.Rating,
                JoiningDate = b.JoiningDate,
                Availabilities = b.Availabilities.Select(a => new BarberAvailabilityDto
                {
                    Id = a.Id,
                    DayOfWeek = a.DayOfWeek,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    IsActive = a.IsActive
                }).ToList()
            }).ToList();

            return Ok(new ApiResponse<List<BarberDto>> 
            { 
                Success = true, 
                Data = barberDtos 
            });
        }

        // GET: api/Barbers/5 
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Barber>>> GetBarber(int id)
        {
            var barber = await _context.Barbers.FindAsync(id);

            if (barber == null)
            {
                return NotFound(new ApiResponse<Barber> 
                { 
                    Success = false, 
                    Message = "Barber not found" 
                });
            }

            return Ok(new ApiResponse<Barber> 
            { 
                Success = true, 
                Data = barber 
            });
        }

        // POST: api/Barbers
        [HttpPost]
        public async Task<ActionResult<ApiResponse<Barber>>> AddBarber(BarberDto dto)
        {
            try 
            {
                var barber = new Barber
                {
                    Name = dto.Name,
                    Role = dto.Role,
                    Phone = dto.Phone,
                    Email = dto.Email,
                    Specialization = dto.Specialization,
                    Bio = dto.Bio,
                    ImageUrl = dto.ImageUrl,
                    IsActive = true,
                    JoiningDate = DateTime.UtcNow
                };

                _context.Barbers.Add(barber);
                await _context.SaveChangesAsync();

                // Now 'GetBarber' (singular) exists so this line will work
                return CreatedAtAction(nameof(GetBarber), new { id = barber.Id }, new ApiResponse<Barber>
                {
                    Success = true,
                    Message = "Barber added successfully",
                    Data = barber
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<Barber>
                {
                    Success = false,
                    Message = "Error adding barber",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PUT: api/Barbers/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<Barber>>> UpdateBarber(int id, BarberDto dto)
        {
            try
            {
                var barber = await _context.Barbers.FindAsync(id);
                if (barber == null)
                {
                    return NotFound(new ApiResponse<Barber> 
                    { 
                        Success = false, 
                        Message = "Barber not found" 
                    });
                }

                barber.Name = dto.Name;
                barber.Role = dto.Role;
                barber.Phone = dto.Phone;
                barber.Email = dto.Email;
                barber.Specialization = dto.Specialization;
                barber.Bio = dto.Bio;
                barber.ImageUrl = dto.ImageUrl;
                barber.IsActive = dto.IsActive;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<Barber> 
                { 
                    Success = true, 
                    Message = "Barber updated successfully", 
                    Data = barber 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<Barber> 
                { 
                    Success = false, 
                    Message = "Update failed", 
                    Errors = new List<string> { ex.Message } 
                });
            }
        }

        // DELETE: api/Barbers/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteBarber(int id)
        {
            try
            {
                var barber = await _context.Barbers.FindAsync(id);
                if (barber == null)
                {
                    return NotFound(new ApiResponse<bool> 
                    { 
                        Success = false, 
                        Message = "Barber not found" 
                    });
                }

                _context.Barbers.Remove(barber);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<bool> 
                { 
                    Success = true, 
                    Message = "Barber deleted successfully", 
                    Data = true 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool> 
                { 
                    Success = false, 
                    Message = "Delete failed", 
                    Errors = new List<string> { ex.Message } 
                });
            }
        }
    
        [HttpPost("{id}/availability")]
        public async Task<IActionResult> SetAvailability(int id, [FromBody] List<BarberAvailabilityDto> availabilityDtos)
        {
            var barber = await _context.Barbers.Include(b => b.Availabilities)
                                            .FirstOrDefaultAsync(b => b.Id == id);

            if (barber == null) 
            {
                // Changed "success" to "Success" and "message" to "Message"
                return NotFound(new ApiResponse<string> { Success = false, Message = "Barber not found" });
            }

            _context.BarberAvailabilities.RemoveRange(barber.Availabilities);

            var newAvailabilities = availabilityDtos.Select(dto => new BarberAvailability
            {
                BarberId = id,
                DayOfWeek = dto.DayOfWeek,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                IsActive = dto.IsActive
            }).ToList();

            _context.BarberAvailabilities.AddRange(newAvailabilities);
            await _context.SaveChangesAsync();

            // Changed "success" to "Success" and "message" to "Message"
            return Ok(new ApiResponse<string> { Success = true, Message = "Availability updated successfully" });
        }
    }
}