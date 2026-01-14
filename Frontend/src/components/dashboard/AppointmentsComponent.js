import { useState, useEffect } from 'react';
import styles from '../../../styles/Barbers.module.css'; 
import CalendarView from './CalendarView';
import { notify } from '../../../utils/notify';

const AppointmentsComponent = ({ user, initialAppointments }) => {
  const [appointments, setAppointments] = useState(initialAppointments || []);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  
  // DATE TRAVEL STATE
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    id: null, clientId: '', barberId: '', serviceId: '', date: '', time: '', notes: '', status: 'Pending'
  });

  useEffect(() => { 
    setMounted(true); 
    fetchReferenceData(); 
  }, []);

  // Fetch appointments when the selected date changes
  useEffect(() => {
    refreshAppointments();
  }, [selectedDate]);

  useEffect(() => {
    if (formData.barberId && formData.serviceId && formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.barberId, formData.serviceId, formData.date]);

  const fetchReferenceData = async () => {
    const headers = { 'Authorization': `Bearer ${user.token}` };
    try {
      const [bRes, sRes, cRes] = await Promise.all([
        fetch('http://localhost:5085/api/Barbers', { headers }),
        fetch('http://localhost:5085/api/Services', { headers }),
        fetch('http://localhost:5085/api/Clients', { headers })
      ]);
      const b = await bRes.json(); const s = await sRes.json(); const c = await cRes.json();
      setBarbers(b.data || []); setServices(s.data || []); setClients(c.data || []);
    } catch (err) { 
      notify.error("Failed to load reference data");
    }
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `http://localhost:5085/api/Appointments/available-slots?barberId=${formData.barberId}&serviceId=${formData.serviceId}&date=${formData.date}`,
        { headers: { 'Authorization': `Bearer ${user.token}` } }
      );
      const result = await res.json();
      
      if (result.success) {
        let slots = result.data || [];
        if (isEditing && formData.time) {
          const currentTime = formData.time.substring(0, 5);
          if (!slots.includes(currentTime)) {
            slots.push(currentTime);
            slots.sort(); 
          }
        }
        setAvailableSlots(slots);
      }
    } catch (err) {
      notify.error("Could not load time slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const refreshAppointments = async () => {
    // Note: If your API supports filtering by date, add ?date=${selectedDate} to the URL
    const res = await fetch(`http://localhost:5085/api/Appointments`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    const result = await res.json();
    if (result.success) setAppointments(result.data);
  };

  const handleEdit = (app) => {
    const d = new Date(app.appointmentDate);
    setFormData({
      id: app.id, clientId: app.clientId, barberId: app.barberId, serviceId: app.serviceId,
      date: d.toISOString().split('T')[0], time: d.toTimeString().substring(0, 5),
      notes: app.notes || '', status: app.status || 'Pending'
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    notify.loading("Deleting...");
    try {
      const res = await fetch(`http://localhost:5085/api/Appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      notify.dismiss();
      if (res.ok) { 
        setShowModal(false); 
        refreshAppointments(); 
        notify.success("Deleted");
      }
    } catch (error) {
      notify.dismiss();
      notify.error("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.time) return notify.error("Select time!");
    notify.loading("Saving...");
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `http://localhost:5085/api/Appointments/${formData.id}` : 'http://localhost:5085/api/Appointments';
    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({
          ...formData,
          clientId: parseInt(formData.clientId),
          barberId: parseInt(formData.barberId),
          serviceId: parseInt(formData.serviceId),
          appointmentDate: `${formData.date}T${formData.time}:00`
        })
      });
      notify.dismiss();
      if (res.ok) { 
        setShowModal(false); 
        refreshAppointments(); 
        notify.success("Saved!");
      }
    } catch (error) {
      notify.dismiss();
      notify.error("Error saving");
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.content}>
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm border">
        <div style={{ width: '300px' }}>
          <input 
            type="text" 
            className="form-control border-0 bg-light" 
            placeholder="🔍 Search appointments..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <button 
          className="btn btn-primary fw-bold px-4" 
          onClick={() => { 
            setIsEditing(false); 
            setFormData({id:null, clientId:'', barberId:'', serviceId:'', date: selectedDate, time:'', notes:'', status:'Pending'}); 
            setAvailableSlots([]);
            setShowModal(true); 
          }}
        >
          + Create Appointment
        </button>
      </div>

      <CalendarView 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        appointments={appointments.filter(a => {
          // Filter by Date AND Search Term
          const isSameDate = a.appointmentDate.split('T')[0] === selectedDate;
          const matchesSearch = a.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                a.barberName?.toLowerCase().includes(searchTerm.toLowerCase());
          return isSameDate && matchesSearch;
        })} 
        onEdit={handleEdit} 
      />

      {/* Modal logic remains exactly as you had it */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor:'rgba(0,0,0,0.6)', zIndex: 1070}}>
            {/* ... modal content ... */}
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-dark text-white border-0">
                        <h5 className="modal-title fw-bold">{isEditing ? 'Manage Booking' : 'New Appointment'}</h5>
                        <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <div className="mb-3">
                                <label className="small fw-bold text-muted">CLIENT</label>
                                <select className="form-select" required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                                    <option value="">Select Client</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="row mb-3">
                                <div className="col-6">
                                    <label className="small fw-bold text-muted">BARBER</label>
                                    <select className="form-select" required value={formData.barberId} onChange={e => setFormData({...formData, barberId: e.target.value})}>
                                        <option value="">Select Barber</option>
                                        {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="small fw-bold text-muted">SERVICE</label>
                                    <select className="form-select" required value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})}>
                                        <option value="">Select Service</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold text-muted">DATE</label>
                                <input type="date" className="form-control" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold text-muted">CHOOSE TIME</label>
                                <div className="d-flex flex-wrap gap-2 mt-2 p-3 bg-light rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {loadingSlots ? (
                                        <div className="text-primary small fw-bold">Calculating availability...</div>
                                    ) : availableSlots.length > 0 ? (
                                        availableSlots.map(s => (
                                            <button key={s} type="button" className={`btn btn-sm ${formData.time === s ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFormData(prev => ({ ...prev, time: s }))}>
                                                {s}
                                            </button>
                                        ))
                                    ) : (
                                        <span className="text-muted small">No slots available</span>
                                    )}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold text-muted">STATUS</label>
                                <select className="form-select fw-bold text-primary border-primary" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer bg-light border-0 d-flex justify-content-between">
                            {isEditing ? <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(formData.id)}>Delete</button> : <div></div>}
                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-4 shadow-sm">Save Booking</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsComponent;