using AdminPanelAPI.Data;
using AdminPanelAPI.DTOs;
using AdminPanelAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdminPanelAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AppointmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Client)
                .Include(a => a.Barber)
                .Include(a => a.Service)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();

            var appointmentDtos = appointments.Select(a => new AppointmentDto // <--- This name must match the class
            {
                Id = a.Id,
                ClientId = a.ClientId,
                ClientName = a.Client?.Name,
                BarberId = a.BarberId,
                BarberName = a.Barber?.Name,
                ServiceId = a.ServiceId,
                ServiceName = a.Service?.Name,
                AppointmentDate = a.AppointmentDate,
                EndTime = a.EndTime,
                Status = a.Status,
                FinalPrice = a.FinalPrice,
                Notes = a.Notes
            }).ToList();

            return Ok(new ApiResponse<List<AppointmentDto>> 
            { 
                Success = true, 
                Data = appointmentDtos 
            });
        }

        [HttpGet("available-slots")]
        public async Task<IActionResult> GetAvailableSlots(int barberId, int serviceId, DateTime date)
        {
            var service = await _context.Services.FindAsync(serviceId);
            if (service == null) return BadRequest(new { success = false, message = "Service not found" });

            var availability = await _context.BarberAvailabilities
                .FirstOrDefaultAsync(a => a.BarberId == barberId && (int)a.DayOfWeek == (int)date.DayOfWeek && a.IsActive);

            if (availability == null) return Ok(new { success = true, data = new List<string>(), message = "Barber does not work on this day" });

            var existingAppointments = await _context.Appointments
                .Where(a => a.BarberId == barberId && a.AppointmentDate.Date == date.Date && a.Status != "Cancelled")
                .ToListAsync();

            var slots = new List<DateTime>();
            var workStart = date.Date.Add(TimeSpan.Parse(availability.StartTime));
            var workEnd = date.Date.Add(TimeSpan.Parse(availability.EndTime));
            
            var currentSlot = workStart;
            while (currentSlot.AddMinutes(service.DurationInMinutes) <= workEnd)
            {
                var slotEnd = currentSlot.AddMinutes(service.DurationInMinutes);
                bool isOccupied = existingAppointments.Any(a => 
                    (currentSlot >= a.AppointmentDate && currentSlot < a.EndTime) || 
                    (slotEnd > a.AppointmentDate && slotEnd <= a.EndTime)
                );

                if (!isOccupied) slots.Add(currentSlot);
                currentSlot = currentSlot.AddMinutes(15);
            }

            return Ok(new { success = true, data = slots.Select(s => s.ToString("HH:mm")) });
        }

        // --- 3. CREATE APPOINTMENT ---
        [HttpPost]
        public async Task<IActionResult> CreateAppointment(AppointmentCreateDto dto)
        {
            var service = await _context.Services.FindAsync(dto.ServiceId);
            if (service == null) return BadRequest(new { success = false, message = "Service not found" });

            var endTime = dto.AppointmentDate.AddMinutes(service.DurationInMinutes);

            bool conflict = await _context.Appointments.AnyAsync(a => 
                a.BarberId == dto.BarberId && a.AppointmentDate.Date == dto.AppointmentDate.Date && a.Status != "Cancelled" &&
                ((dto.AppointmentDate >= a.AppointmentDate && dto.AppointmentDate < a.EndTime) || 
                 (endTime > a.AppointmentDate && endTime <= a.EndTime)));

            if (conflict) return BadRequest(new { success = false, message = "This slot was just taken." });

            var appointment = new Appointment
            {
                ClientId = dto.ClientId,
                BarberId = dto.BarberId,
                ServiceId = dto.ServiceId,
                AppointmentDate = dto.AppointmentDate,
                EndTime = endTime,
                FinalPrice = service.Price,
                Notes = dto.Notes,
                Status = "Pending"
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            var response = new AppointmentDto
            {
                Id = appointment.Id,
                AppointmentDate = appointment.AppointmentDate,
                Status = appointment.Status
            };

            return Ok(new ApiResponse<AppointmentDto> { Success = true, Data = response });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAppointment(int id, [FromBody] AppointmentUpdateDto updateDto)
        {
            if (id != updateDto.Id)
            {
                return BadRequest(new { success = false, message = "ID mismatch" });
            }

            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new { success = false, message = "Appointment not found" });
            }

            var service = await _context.Services.FindAsync(updateDto.ServiceId);
            if (service == null)
            {
                return BadRequest(new { success = false, message = "Invalid Service selected" });
            }

            appointment.ClientId = updateDto.ClientId;
            appointment.BarberId = updateDto.BarberId;
            appointment.ServiceId = updateDto.ServiceId;
            appointment.AppointmentDate = updateDto.AppointmentDate;
            appointment.Status = updateDto.Status;
            appointment.Notes = updateDto.Notes;

            appointment.EndTime = updateDto.AppointmentDate.AddMinutes(service.DurationInMinutes);
            appointment.FinalPrice = service.Price;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Appointment updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Database error: " + ex.Message });
            }
        }

        // DELETE: api/Appointments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new { success = false, message = "Appointment not found" });
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Appointment deleted successfully" });
        }

    }
}