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

        // 1. CREATE: Generate a new invoice & Complete the Appointment
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInvoiceDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
                return BadRequest(new { success = false, message = "Invoice must have at least one item." });

            var invNumber = $"INV-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // FIX: Define subtotal BEFORE using it in the object initializer
                var subtotal = dto.Items.Sum(i => i.Quantity * i.UnitPrice);

                var invoice = new Invoice
                {
                    InvoiceNumber = invNumber,
                    ClientId = dto.ClientId,
                    AppointmentId = dto.AppointmentId,
                    IssueDate = DateTime.UtcNow,
                    DueDate = DateTime.UtcNow.AddDays(3),
                    Status = "Paid",
                    PaymentMethod = dto.PaymentMethod,
                    Discount = dto.Discount, 
                    TotalAmount = Math.Max(0, subtotal - dto.Discount), // Now 'subtotal' is recognized
                    Items = dto.Items.Select(i => new InvoiceItem
                    {
                        Description = i.Description,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice
                    }).ToList()
                };

                _context.Invoices.Add(invoice);

                if (dto.AppointmentId.HasValue)
                {
                    var appointment = await _context.Appointments.FindAsync(dto.AppointmentId.Value);
                    if (appointment != null)
                    {
                        appointment.Status = "Completed";
                        _context.Appointments.Update(appointment);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, data = invoice });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Internal server error during checkout" });
            }
        }

        // 2. GET ALL: List all invoices
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

        // 3. GET BY ID: Fetch full details
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

        // 4. UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInvoice(int id, [FromBody] CreateInvoiceDto dto)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
            {
                return NotFound(new { success = false, message = "Invoice not found" });
            }

            invoice.ClientId = dto.ClientId;
            invoice.AppointmentId = dto.AppointmentId;
            invoice.PaymentMethod = dto.PaymentMethod;
            invoice.Discount = dto.Discount;

            _context.InvoiceItems.RemoveRange(invoice.Items);

            invoice.Items = dto.Items.Select(item => new InvoiceItem
            {
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                InvoiceId = id 
            }).ToList();

            var subtotal = invoice.Items.Sum(i => i.UnitPrice * i.Quantity);
            invoice.TotalAmount = Math.Max(0, subtotal - dto.Discount);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Invoice updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error: " + ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return NotFound();

            invoice.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"Invoice status updated to {newStatus}" });
        }

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