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
    public class ClientsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Clients
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<Client>>>> GetClients()
        {
            // Sorted by newest first so Admin sees recent clients immediately
            var clients = await _context.Clients
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(new ApiResponse<IEnumerable<Client>> 
            { 
                Success = true, 
                Data = clients 
            });
        }

        // GET: api/Clients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Client>>> GetClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound(new ApiResponse<Client> 
                { 
                    Success = false, 
                    Message = "Client not found" 
                });
            }

            return Ok(new ApiResponse<Client> 
            { 
                Success = true, 
                Data = client 
            });
        }

        // POST: api/Clients
        [HttpPost]
        public async Task<ActionResult<ApiResponse<Client>>> AddClient(ClientUpsertDto dto)
        {
            try 
            {
                var client = new Client
                {
                    Name = dto.Name,
                    Phone = dto.Phone,
                    Status = dto.Status ?? "Active",
                    Gender = dto.Gender,
                    Address = dto.Address,
                    InternalNotes = dto.InternalNotes,
                    CreatedAt = DateTime.UtcNow // Ensure server time is used
                };

                _context.Clients.Add(client);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetClient), new { id = client.Id }, new ApiResponse<Client>
                {
                    Success = true,
                    Message = "Client added successfully",
                    Data = client
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<Client>
                {
                    Success = false,
                    Message = "Error adding client",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PUT: api/Clients/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<Client>>> UpdateClient(int id, ClientUpsertDto dto)
        {
            try
            {
                var client = await _context.Clients.FindAsync(id);
                if (client == null)
                {
                    return NotFound(new ApiResponse<Client> 
                    { 
                        Success = false, 
                        Message = "Client not found" 
                    });
                }

                // Update fields
                client.Name = dto.Name;
                client.Phone = dto.Phone;
                client.Status = dto.Status;
                client.Gender = dto.Gender;
                client.Address = dto.Address;
                client.InternalNotes = dto.InternalNotes;
                
                // Set the updated timestamp
                client.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<Client> 
                { 
                    Success = true, 
                    Message = "Client updated successfully", 
                    Data = client 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<Client> 
                { 
                    Success = false, 
                    Message = "Update failed", 
                    Errors = new List<string> { ex.Message } 
                });
            }
        }

        // DELETE: api/Clients/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteClient(int id)
        {
            try
            {
                var client = await _context.Clients.FindAsync(id);
                if (client == null)
                {
                    return NotFound(new ApiResponse<bool> 
                    { 
                        Success = false, 
                        Message = "Client not found" 
                    });
                }

                _context.Clients.Remove(client);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<bool> 
                { 
                    Success = true, 
                    Message = "Client deleted successfully", 
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