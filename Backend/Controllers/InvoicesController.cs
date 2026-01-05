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
    public class InvoicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public InvoicesController(ApplicationDbContext context) 
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<Invoice>>>> GetInvoices()
        {
            var data = await _context.Invoices.ToListAsync();
            return Ok(new ApiResponse<IEnumerable<Invoice>> 
            { 
                Success = true, 
                Data = data 
            });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<Invoice>>> Create(InvoiceCreateDto dto)
        {
            try 
            {
                // 1. Calculate the next number based on current count
                var count = await _context.Invoices.CountAsync();
                string newInvoiceId = $"INV-{DateTime.Now.Year}-{(count + 1):D3}";

                var invoice = new Invoice
                {
                    InvoiceNumber = newInvoiceId, // Set the Key here
                    ClientName = dto.ClientName,
                    Amount = dto.Amount,
                    Status = dto.Status,
                    DueDate = dto.DueDate
                };

                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<Invoice> { Success = true, Data = invoice });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<Invoice> { Success = false, Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<Invoice>>> Update(string id, InvoiceCreateDto dto)
        {
            var invoice = await _context.Invoices.FirstOrDefaultAsync(x => x.InvoiceNumber == id);
            
            if (invoice == null) 
                return NotFound(new ApiResponse<Invoice> { Success = false, Message = "Not found" });

            invoice.ClientName = dto.ClientName;
            invoice.Amount = dto.Amount;
            invoice.Status = dto.Status;
            invoice.DueDate = dto.DueDate;

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<Invoice> { Success = true, Data = invoice });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(string id) // Changed int to string
        {
            // Find the invoice by the string InvoiceNumber
            var invoice = await _context.Invoices.FirstOrDefaultAsync(x => x.InvoiceNumber == id);
            
            if (invoice == null) 
            {
                return NotFound(new ApiResponse<bool> { 
                    Success = false, 
                    Message = "Invoice not found" 
                });
            }

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
            
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }
    }
}