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
        public async Task<ActionResult<ApiResponse<IEnumerable<Barber>>>> GetBarbers()
        {
            var barbers = await _context.Barbers.OrderByDescending(b => b.JoiningDate).ToListAsync();
            return Ok(new ApiResponse<IEnumerable<Barber>> 
            { 
                Success = true, 
                Data = barbers 
            });
        }

        // GET: api/Barbers/5 - ADDED THIS TO FIX THE ERROR
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
    }
}