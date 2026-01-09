import { useState } from 'react';
import styles from '../../../styles/Users.module.css';

const BarbersComponent = ({ user, initialBarbers }) => {
  const [barbers, setBarbers] = useState(initialBarbers || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [deletingBarberId, setDeletingBarberId] = useState(null);

  // Updated to match BarberDto fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    specialization: '',
    bio: '',
    imageUrl: '',
    isActive: true,
  });

  const filteredBarbers = barbers.filter(b =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingBarber(null);
    setFormData({ 
        name: '', email: '', role: '', phone: '', 
        specialization: '', bio: '', imageUrl: '', isActive: true 
    });
    setShowModal(true);
  };

  const handleEditClick = (barber) => {
    setEditingBarber(barber);
    setFormData({ 
      name: barber.name, 
      email: barber.email, 
      role: barber.role, 
      phone: barber.phone, 
      specialization: barber.specialization,
      bio: barber.bio,
      imageUrl: barber.imageUrl,
      isActive: barber.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Using the capitalized 'Barber' route we discussed
    const url = 'http://localhost:5085/api/Barbers'; 
    const method = editingBarber ? 'PUT' : 'POST';
    const finalUrl = editingBarber ? `${url}/${editingBarber.id}` : url;

    try {
      const response = await fetch(finalUrl, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        if (editingBarber) {
          setBarbers(barbers.map(b => b.id === editingBarber.id ? result.data : b));
        } else {
          setBarbers([...barbers, result.data]);
        }
        setShowModal(false);
      }
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:5085/api/Barbers/${deletingBarberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setBarbers(barbers.filter(b => b.id !== deletingBarberId));
        setShowDeleteModal(false);
        setDeletingBarberId(null);
      }
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.actionBar}>
        <input 
          type="text" 
          placeholder="Search by name, role or skill..." 
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
                {filteredBarbers.map((barber) => (
                  <tr key={barber.id}>
                    <td className="ps-4">
                        <div className="d-flex align-items-center">
                            <img 
                                src={barber.imageUrl || 'https://via.placeholder.com/40'} 
                                className="rounded-circle me-3" 
                                width="40" height="40" alt="profile"
                                style={{objectFit: 'cover'}}
                            />
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
                      <button className="btn btn-sm btn-outline-primary me-2 shadow-sm" onClick={() => handleEditClick(barber)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => { setDeletingBarberId(barber.id); setShowDeleteModal(true); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header border-bottom-0">
                  <h5 className="modal-title fw-bold">{editingBarber ? 'Edit Barber' : 'Add New Barber'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body px-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label small text-muted">Full Name</label>
                        <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label small text-muted">Email</label>
                        <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label small text-muted">Role (e.g. Master Barber)</label>
                        <input type="text" className="form-control" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label small text-muted">Phone</label>
                        <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="col-md-12 mb-3">
                        <label className="form-label small text-muted">Specialization (Skills)</label>
                        <input type="text" className="form-control" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} placeholder="Fades, Beard Trim, etc." />
                    </div>
                    <div className="col-md-12 mb-3">
                        <label className="form-label small text-muted">Bio</label>
                        <textarea className="form-control" rows="2" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}></textarea>
                    </div>
                    <div className="col-md-12 mb-3">
                        <label className="form-label small text-muted">Profile Image URL</label>
                        <input type="text" className="form-control" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">{editingBarber ? 'Update Barber' : 'Create Barber'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow p-3 text-center">
              <div className="modal-body">
                <div className="text-danger mb-3" style={{fontSize: '2rem'}}>⚠️</div>
                <h5 className="fw-bold">Remove Staff?</h5>
                <p className="small text-muted">Are you sure you want to delete this barber from the system?</p>
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button className="btn btn-light px-3" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn btn-danger px-3" onClick={handleDeleteConfirm}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbersComponent;