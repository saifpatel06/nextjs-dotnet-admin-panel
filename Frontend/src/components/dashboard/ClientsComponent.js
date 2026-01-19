import { useState } from 'react';
import styles from '../../../styles/Users.module.css';
import { notify } from '../../../utils/notify';

const ClientsComponent = ({ user, initialClients }) => {
  const [clients, setClients] = useState(initialClients || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClientId, setDeletingClientId] = useState(null);

  // UPDATED: Matches your new schema
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    status: 'Active',
    gender: '',
    address: '',
    internalNotes: ''
  });

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', phone: '', status: 'Active', gender: '', address: '', internalNotes: '' });
    setShowModal(true);
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setFormData({ 
      name: client.name, 
      phone: client.phone, 
      status: client.status,
      gender: client.gender || '',
      address: client.address || '',
      internalNotes: client.internalNotes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = 'http://localhost:5085/api/Clients';
    const method = editingClient ? 'PUT' : 'POST';
    const finalUrl = editingClient ? `${url}/${editingClient.id}` : url;

    notify.loading(editingClient ? "Updating client..." : "Creating client...");

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
      notify.dismiss(); 

      if (result.success) {
        if (editingClient) {
          setClients(clients.map(c => c.id === editingClient.id ? result.data : c));
        } else {
          setClients([result.data, ...clients]); // Newest at top
        }
        setShowModal(false);
        notify.success("Client saved successfully!"); 
      } else {
        notify.error(result.message || "Failed to save client."); 
      }
    } catch (error) {
      notify.dismiss();
      notify.error("Network error. Please try again.");
    }
  };

  const handleDeleteConfirm = async () => {
    notify.loading("Deleting client record...");
    try {
      const response = await fetch(`http://localhost:5085/api/Clients/${deletingClientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      notify.dismiss();

      if (result.success) {
        setClients(clients.filter(c => c.id !== deletingClientId));
        setShowDeleteModal(false);
        notify.success("Client deleted successfully.");
      } else {
        notify.error(result.message || "Could not delete client.");
      }
    } catch (error) {
      notify.dismiss();
      notify.error("Network error occurred.");
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.actionBar}>
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="form-control w-50 shadow-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          + Add New Client
        </button>
      </div>

      <div className="card shadow-sm border-0 mt-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Name</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td className="ps-4">
                        <div className="fw-bold">{client.name}</div>
                        <small className="text-muted">{client.address || 'No address'}</small>
                    </td>
                    <td>{client.phone}</td>
                    <td>{client.gender || '-'}</td>
                    <td>
                      <span className={`badge rounded-pill ${client.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-primary me-2 shadow-sm" onClick={() => handleEditClick(client)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => { setDeletingClientId(client.id); setShowDeleteModal(true); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- FORM MODAL --- */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header border-bottom-0">
                  <h5 className="modal-title fw-bold">{editingClient ? 'Edit Client' : 'Add New Client'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body px-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label small text-muted">Full Name *</label>
                        <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label small text-muted">Phone Number *</label>
                        <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label small text-muted">Gender</label>
                        <select className="form-select" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label small text-muted">Status</label>
                        <select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Address (Optional)</label>
                    <input type="text" className="form-control" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Internal Notes (Private)</label>
                    <textarea className="form-control" rows="3" value={formData.internalNotes} onChange={(e) => setFormData({...formData, internalNotes: e.target.value})} placeholder="E.g. Customer prefers morning slots..."></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">{editingClient ? 'Save Changes' : 'Create Client'}</button>
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
                <h5 className="fw-bold">Confirm Delete</h5>
                <p className="small text-muted">Are you sure? This action cannot be undone.</p>
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

export default ClientsComponent;