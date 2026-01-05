import { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import styles from '../../../styles/Users.module.css';

const ClientsComponent = ({ user, initialClients }) => {
  const [clients, setClients] = useState(initialClients || []);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClientId, setDeletingClientId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    status: 'Active',
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', company: '', phone: '', status: 'Active' });
    setShowModal(true);
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setFormData({ 
      name: client.name, 
      email: client.email, 
      company: client.company, 
      phone: client.phone, 
      status: client.status 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = 'http://localhost:5085/api/Clients';
    const method = editingClient ? 'PUT' : 'POST';
    const finalUrl = editingClient ? `${url}/${editingClient.id}` : url;

    try {
      const response = await fetch(finalUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        if (editingClient) {
          setClients(clients.map(c => c.id === editingClient.id ? result.data : c));
        } else {
          setClients([...clients, result.data]);
        }
        setShowModal(false);
      }
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:5085/api/Clients/${deletingClientId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setClients(clients.filter(c => c.id !== deletingClientId));
        setShowDeleteModal(false);
        setDeletingClientId(null);
      }
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  return (
    <div className={styles.usersWrapper}>
      <Sidebar isOpen={sidebarOpen} activePage="clients" />
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button className={styles.menuToggle} onClick={toggleSidebar}>☰</button>
          <h1 className={styles.pageTitle}>Client Management</h1>
        </header>

        <main className={styles.content}>
          <div className={styles.actionBar}>
            <input 
                type="text" 
                placeholder="Search clients..." 
                className="form-control w-50" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button className="btn btn-success" onClick={handleOpenAddModal}>+ Add Client</button>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-body p-0">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td className="ps-4 fw-bold">{client.name}</td>
                      <td>{client.email}</td>
                      <td>{client.company}</td>
                      <td>
                        <span className={`badge ${client.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(client)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => { setDeletingClientId(client.id); setShowDeleteModal(true); }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleSubmit}>
                <div className="modal-header border-bottom-0">
                  <h5 className="modal-title fw-bold">{editingClient ? 'Edit Client' : 'Add New Client'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body px-4">
                  <div className="mb-3"><label className="form-label small text-muted">Name</label><input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                  <div className="mb-3"><label className="form-label small text-muted">Email</label><input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                  <div className="mb-3"><label className="form-label small text-muted">Company</label><input type="text" className="form-control" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} /></div>
                  <div className="mb-3"><label className="form-label small text-muted">Phone</label><input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">{editingClient ? 'Update Client' : 'Create Client'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
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