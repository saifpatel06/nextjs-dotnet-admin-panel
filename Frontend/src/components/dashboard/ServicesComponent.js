import { useState, useEffect } from 'react';
import styles from '../../../styles/Services.module.css';
import { notify } from '../../../utils/notify';

const ServicesComponent = ({ user }) => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);

  const categories = ['Haircut', 'Beard', 'Shave', 'Combo', 'Kids', 'Treatments'];
  const durationOptions = [15, 30, 45, 60, 75, 90, 120];

  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, durationInMinutes: 30, category: 'Haircut', isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:5085/api/Services', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const result = await res.json();
      if (result.success) setServices(result.data);
    } catch (error) {
      notify.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = (services || []).filter(s => {
    const search = searchTerm.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(search) ||
      (s.category || "").toLowerCase().includes(search)
    );
  });

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', price: 0, durationInMinutes: 30, category: 'Haircut', isActive: true });
    setShowModal(true);
  };

  const handleEditClick = (service) => {
    setEditingService(service);
    setFormData({ ...service });
    setShowModal(true);
  };

  const handleDeleteRequest = (service) => {
    setDeletingService(service);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = notify.loading(editingService ? "Updating..." : "Creating...");
    
    const url = editingService 
      ? `http://localhost:5085/api/Services/${editingService.id}` 
      : 'http://localhost:5085/api/Services';
    
    try {
      const res = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        notify.dismiss();
        notify.success("Service saved!");
        fetchServices();
        setShowModal(false);
      }
    } catch (error) {
      notify.dismiss();
      notify.error("Connection error");
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5085/api/Services/${deletingService.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        notify.success("Service deleted");
        fetchServices();
        setShowDeleteModal(false);
      }
    } catch (error) {
      notify.error("Delete failed");
    }
  };

  return (
    <div className={styles.content}>
      {/* Action Bar with Search */}
      <div className={styles.actionBar + " d-flex justify-content-between mb-4"}>
        <input
          type="text"
          placeholder="Search services..."
          className="form-control w-50 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary shadow-sm" onClick={handleOpenAddModal}>
          + Add New Service
        </button>
      </div>

      <div className="row">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div key={service.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge bg-soft-primary text-primary border px-3 py-2" style={{ backgroundColor: '#e7f1ff' }}>
                      {service.category}
                    </span>
                    <h4 className="fw-bold text-dark mb-0">${service.price.toFixed(2)}</h4>
                  </div>
                  <h5 className="card-title fw-bold">{service.name}</h5>
                  <p className="card-text text-muted small" style={{ minHeight: '40px' }}>
                    {service.description || "No description provided."}
                  </p>
                  <div className="d-flex align-items-center gap-3 mt-3 pt-3 border-top">
                    <div className="small text-muted">
                      <i className="bi bi-clock me-1"></i> {service.durationInMinutes} mins
                    </div>
                    <div className="ms-auto">
                        <span className={`badge rounded-pill ${service.isActive ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                           {service.isActive ? 'Active' : 'Hidden'}
                        </span>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 pb-3 d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary w-100" onClick={() => handleEditClick(service)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger px-3" onClick={() => handleDeleteRequest(service)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center p-5">
            <h5 className="text-muted">No services found matching your search.</h5>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editingService ? 'Edit Service' : 'Add Service'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4">
                  <div className="mb-3">
                    <label className="small fw-bold text-muted">Service Name</label>
                    <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="small fw-bold text-muted">Price ($)</label>
                      <input type="number" step="0.01" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="small fw-bold text-muted">Duration</label>
                      <select className="form-select" value={formData.durationInMinutes} onChange={e => setFormData({...formData, durationInMinutes: parseInt(e.target.value)})}>
                        {durationOptions.map(opt => <option key={opt} value={opt}>{opt} mins</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold text-muted">Category</label>
                    <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold text-muted">Description</label>
                    <textarea className="form-control" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Save Service</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content text-center p-4 shadow border-0" style={{ borderRadius: '20px' }}>
              <div className="text-danger mb-2">
                <i className="bi bi-exclamation-octagon-fill" style={{ fontSize: '2.5rem' }}></i>
              </div>
              <h5 className="fw-bold">Delete Service?</h5>
              <p className="small text-muted mb-4">Confirm to remove <strong>{deletingService?.name}</strong> from your menu.</p>
              <div className="d-grid gap-2">
                <button className="btn btn-danger fw-bold" onClick={confirmDelete}>Yes, Delete</button>
                <button className="btn btn-light" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesComponent;