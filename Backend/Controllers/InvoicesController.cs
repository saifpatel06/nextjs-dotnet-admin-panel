using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AdminPanelAPI.Data;
using AdminPanelAPI.Models;
using AdminPanelAPI.Dtos;
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

        // 1. CREATE: Generate a new invoice
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInvoiceDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
                return BadRequest(new { success = false, message = "Invoice must have at least one item." });

            var invNumber = $"INV-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

            var invoice = new Invoice
            {
                InvoiceNumber = invNumber,
                ClientId = dto.ClientId,
                AppointmentId = dto.AppointmentId,
                IssueDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(3),
                Status = "Pending",
                TotalAmount = dto.Items.Sum(i => i.Quantity * i.UnitPrice),
                Items = dto.Items.Select(i => new InvoiceItem
                {
                    Description = i.Description,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = invoice });
        }

        // 2. GET ALL: List all invoices (with Client info)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var invoices = await _context.Invoices
                .Include(i => i.Client)
                .Include(i => i.Items)
                .OrderByDescending(i => i.IssueDate)
                .ToListAsync();

            return Ok(new { success = true, data = invoices });
        }

        // 3. GET BY ID: Fetch full details including line items
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Client)
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null) return NotFound(new { success = false, message = "Invoice not found" });

            return Ok(new { success = true, data = invoice });
        }

        // 4. UPDATE STATUS: Change to "Paid" or "Cancelled"
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return NotFound();

            invoice.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"Invoice status updated to {newStatus}" });
        }

        // 5. DELETE: Remove an invoice
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return NotFound();

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Invoice deleted" });
        }
    }
}