using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AdminPanelAPI.Data;
using AdminPanelAPI.Models;
using AdminPanelAPI.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace AdminPanelAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ServicesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Services
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<Service>>>> GetServices()
        {
            var services = await _context.Services.OrderBy(s => s.Category).ToListAsync();
            return Ok(new ApiResponse<IEnumerable<Service>>
            {
                Success = true,
                Data = services
            });
        }

        // GET: api/Services/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Service>>> GetService(int id)
        {
            var service = await _context.Services.FindAsync(id);

            if (service == null)
            {
                return NotFound(new ApiResponse<Service>
                {
                    Success = false,
                    Message = "Service not found"
                });
            }

            return Ok(new ApiResponse<Service>
            {
                Success = true,
                Data = service
            });
        }

        // POST: api/Services
        [HttpPost]
        public async Task<ActionResult<ApiResponse<Service>>> AddService(ServiceCreateDto dto)
        {
            try
            {
                var service = new Service
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    Price = dto.Price,
                    DurationInMinutes = dto.DurationInMinutes,
                    Category = dto.Category,
                    IsActive = dto.IsActive
                };

                _context.Services.Add(service);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetService), new { id = service.Id }, new ApiResponse<Service>
                {
                    Success = true,
                    Message = "Service added successfully",
                    Data = service
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<Service>
                {
                    Success = false,
                    Message = "Error adding service",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PUT: api/Services/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<Service>>> UpdateService(int id, ServiceCreateDto dto)
        {
            try
            {
                var service = await _context.Services.FindAsync(id);
                if (service == null)
                {
                    return NotFound(new ApiResponse<Service>
                    {
                        Success = false,
                        Message = "Service not found"
                    });
                }

                // Update fields from DTO
                service.Name = dto.Name;
                service.Description = dto.Description;
                service.Price = dto.Price;
                service.DurationInMinutes = dto.DurationInMinutes;
                service.Category = dto.Category;
                service.IsActive = dto.IsActive;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<Service>
                {
                    Success = true,
                    Message = "Service updated successfully",
                    Data = service
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<Service>
                {
                    Success = false,
                    Message = "Update failed",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // DELETE: api/Services/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteService(int id)
        {
            try
            {
                var service = await _context.Services.FindAsync(id);
                if (service == null)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Service not found"
                    });
                }

                _context.Services.Remove(service);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Service deleted successfully",
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