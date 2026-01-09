import { useState } from 'react';
import styles from '../../../styles/Barbers.module.css';

const BarbersComponent = ({ user, initialBarbers }) => {
  const [barbers, setBarbers] = useState(initialBarbers || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [deletingBarberId, setDeletingBarberId] = useState(null);

  // --- Availability Logic ---
  const [activeTab, setActiveTab] = useState('basic');
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [formData, setFormData] = useState({
    name: '', email: '', role: '', phone: '',
    specialization: '', bio: '', imageUrl: '', isActive: true,
  });

  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDayToAdd, setSelectedDayToAdd] = useState("0");

  // Search Filter
  const filteredBarbers = (barbers || []).filter(b => {
    const search = searchTerm.toLowerCase();
    return (
      (b.name || "").toLowerCase().includes(search) ||
      (b.role || "").toLowerCase().includes(search) ||
      (b.specialization || "").toLowerCase().includes(search)
    );
  });

  // --- New Admin Actions for Days ---
  const handleAddDay = () => {
    const dayIndex = parseInt(selectedDayToAdd);
    // Prevent adding the same day twice
    if (availabilityData.some(a => a.dayOfWeek === dayIndex)) {
      alert("This day is already added to the schedule.");
      return;
    }

    const newDay = {
      dayOfWeek: dayIndex,
      startTime: "09:00",
      endTime: "18:00",
      isActive: true
    };

    // Add and sort by day of week
    setAvailabilityData([...availabilityData, newDay].sort((a, b) => a.dayOfWeek - b.dayOfWeek));
  };

  const handleRemoveDay = (index) => {
    setAvailabilityData(availabilityData.filter((_, i) => i !== index));
  };

  const handleOpenAddModal = () => {
    setEditingBarber(null);
    setActiveTab('basic');
    setFormData({ name: '', email: '', role: '', phone: '', specialization: '', bio: '', imageUrl: '', isActive: true });
    setAvailabilityData([]);
    setShowModal(true);
  };

  const handleEditClick = (barber) => {
    setEditingBarber(barber);
    setActiveTab('basic');
    setFormData({
      name: barber.name, email: barber.email, role: barber.role,
      phone: barber.phone, specialization: barber.specialization,
      bio: barber.bio, imageUrl: barber.imageUrl, isActive: barber.isActive
    });

    if (barber.availabilities && barber.availabilities.length > 0) {
      const sorted = [...barber.availabilities].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      setAvailabilityData(sorted);
    } else {
      setAvailabilityData([]);
    }
    setShowModal(true);
  };

  const handleAvailabilityChange = (index, field, value) => {
    const updated = [...availabilityData];
    updated[index][field] = value;
    setAvailabilityData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const baseUrl = 'http://localhost:5085/api/Barbers';
    const method = editingBarber ? 'PUT' : 'POST';
    const finalUrl = editingBarber ? `${baseUrl}/${editingBarber.id}` : baseUrl;

    try {
      const response = await fetch(finalUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        const barberId = editingBarber ? editingBarber.id : result.data.id;

        // Save only the added working days
        await fetch(`${baseUrl}/${barberId}/availability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
          body: JSON.stringify(availabilityData),
        });

        const refreshRes = await fetch(baseUrl, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const refreshData = await refreshRes.json();
        if (refreshData.success) setBarbers(refreshData.data);

        setShowModal(false);
        alert("Barber saved successfully!");
      }
    } catch (error) {
      console.error("Admin Save Error:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:5085/api/Barbers/${deletingBarberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        setBarbers(barbers.filter(b => b.id !== deletingBarberId));
        setShowDeleteModal(false);
      }
    } catch (error) { console.error(error); }
  };

  const handleAddWeekdays = () => {
    // Day indexes for Mon (1) through Fri (5)
    const weekdays = [1, 2, 3, 4, 5];
    
    const newDays = weekdays
      .filter(dayIdx => !availabilityData.some(a => a.dayOfWeek === dayIdx))
      .map(dayIdx => ({
        dayOfWeek: dayIdx,
        startTime: "09:00",
        endTime: "18:00",
        isActive: true
      }));

    if (newDays.length === 0) {
      alert("All weekdays are already in the schedule.");
      return;
    }

    setAvailabilityData([...availabilityData, ...newDays].sort((a, b) => a.dayOfWeek - b.dayOfWeek));
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear the entire schedule?")) {
      setAvailabilityData([]);
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.actionBar}>
        <input
          type="text"
          placeholder="Search staff..."
          className="form-control w-50 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          + Add New Barber
        </button>
      </div>

      <div className="card shadow-sm border-0 mt-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Barber</th>
                  <th>Role</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBarbers.length > 0 ? (
                  filteredBarbers.map((barber) => (
                    <tr key={barber.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <img src={barber.imageUrl || 'https://via.placeholder.com/40'} className="rounded-circle me-3" width="40" height="40" style={{ objectFit: 'cover' }} />
                          <div>
                            <div className="fw-bold">{barber.name}</div>
                            <div className="small text-muted">{barber.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{barber.role}</span></td>
                      <td className="small text-muted">{barber.specialization}</td>
                      <td>
                        <span className={`badge rounded-pill ${barber.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {barber.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(barber)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => { setDeletingBarberId(barber.id); setShowDeleteModal(true); }}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center p-5 text-muted">No barbers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editingBarber ? 'Edit Barber' : 'Add New Barber'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <ul className="nav nav-tabs px-4">
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>Basic Details</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'hours' ? 'active text-primary fw-bold' : ''}`} onClick={() => setActiveTab('hours')}>Working Hours</button>
                </li>
              </ul>

              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4 pt-4" style={{ minHeight: '400px' }}>
                  {activeTab === 'basic' ? (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="small text-muted">Full Name</label>
                        <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small text-muted">Email</label>
                        <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small text-muted">Role</label>
                        <input type="text" className="form-control" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small text-muted">Phone</label>
                        <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="small text-muted">Specialization</label>
                        <input type="text" className="form-control" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="d-flex gap-2 mb-3">
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleAddWeekdays}>
                          + Add Mon-Fri
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleClearAll}>
                          Clear All
                        </button>
                      </div>

                      <div className="row g-2 mb-4 align-items-end bg-light p-3 rounded border">
                        <div className="col-md-8">
                          <label className="small fw-bold text-muted">Select Day to Add</label>
                          <select 
                            className="form-select" 
                            value={selectedDayToAdd} 
                            onChange={(e) => setSelectedDayToAdd(e.target.value)}
                          >
                            {daysOfWeek.map((day, idx) => (
                              <option key={idx} value={idx}>{day}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <button type="button" className="btn btn-primary w-100" onClick={handleAddDay}>
                            + Add Day
                          </button>
                        </div>
                      </div>
                      <div className="table-responsive">
                        <table className="table table-sm align-middle">
                          <thead>
                            <tr className="small text-muted">
                              <th>Day</th>
                              <th>Times</th>
                              <th className="text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {availabilityData.length > 0 ? (
                              availabilityData.map((item, index) => (
                                <tr key={index}>
                                  <td className="fw-bold">{daysOfWeek[item.dayOfWeek]}</td>
                                  <td>
                                    <div className="d-flex align-items-center gap-2">
                                      <input type="time" className="form-control form-control-sm" value={item.startTime} onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)} />
                                      <span>-</span>
                                      <input type="time" className="form-control form-control-sm" value={item.endTime} onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)} />
                                    </div>
                                  </td>
                                  <td className="text-end">
                                    <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => handleRemoveDay(index)}>Remove</button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan="3" className="text-center py-4 text-muted small">No working days added yet. Use the selector above to add days.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save All Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content text-center p-3 shadow border-0">
              <h5 className="fw-bold mt-2">Remove Staff?</h5>
              <p className="small text-muted">This action cannot be undone.</p>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <button className="btn btn-light" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbersComponent;