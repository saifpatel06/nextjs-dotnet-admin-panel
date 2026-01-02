import { useState, useEffect } from 'react';
import Sidebar from '../src/components/Sidebar';
import styles from '../styles/Invoices.module.css';

const Invoices = ({ initialInvoices }) => {
  const [invoices, setInvoices] = useState(initialInvoices || []);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // New states for Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientName: '',
    amount: 0,
    status: 'Unpaid',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({ ...invoice, dueDate: invoice.dueDate.split('T')[0] });
    } else {
      setEditingInvoice(null);
      setFormData({ invoiceNumber: '', clientName: '', amount: 0, status: 'Unpaid', dueDate: new Date().toISOString().split('T')[0] });
    }
    setShowModal(true);
  };

  // Triggered when user clicks the red Delete button in the table
  const confirmDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      const res = await fetch(`http://localhost:5085/api/Invoices/${invoiceToDelete.invoiceNumber}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setInvoices(invoices.filter(inv => inv.invoiceNumber !== invoiceToDelete.invoiceNumber));
        setDeleteModalOpen(false);
        setInvoiceToDelete(null);
      }
    } catch (error) { console.error("Error deleting:", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = 'http://localhost:5085/api/Invoices';
    const method = editingInvoice ? 'PUT' : 'POST';
    const finalUrl = editingInvoice ? `${url}/${editingInvoice.invoiceNumber}` : url;

    try {
      const response = await fetch(finalUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        if (editingInvoice) {
          setInvoices(invoices.map(inv => inv.invoiceNumber === editingInvoice.invoiceNumber ? result.data : inv));
        } else {
          setInvoices([...invoices, result.data]);
        }
        setShowModal(false);
      }
    } catch (error) { console.error("Error saving:", error); }
  };

  return (
    <div className={styles.usersWrapper}>
      <Sidebar isOpen={sidebarOpen} activePage="invoices" />
      
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button className={styles.menuToggle} onClick={toggleSidebar}>☰</button>
          <h1 className={styles.pageTitle}>Invoice Management</h1>
        </header>

        <main className={styles.content}>
          <div className={styles.actionBar}>
            <input 
              type="text" 
              placeholder="Search by Inv# or Client..." 
              className="form-control w-50" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button className="btn btn-success" onClick={() => handleOpenModal()}>+ Add Invoice</button>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Inv #</th>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="d-none d-md-table-cell">Due Date</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.invoiceNumber}>
                        <td className="ps-4"><strong>{inv.invoiceNumber}</strong></td>
                        <td>{inv.clientName}</td>
                        <td>${inv.amount.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${inv.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="d-none d-md-table-cell">
                          {isClient ? new Date(inv.dueDate).toLocaleDateString() : ""}
                        </td>
                        <td className="text-end pe-4">
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(inv)}>Edit</button>
                          {/* Updated button to trigger new modal */}
                          <button className="btn btn-sm btn-outline-danger" onClick={() => confirmDelete(inv)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Main Edit/Create Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title font-weight-bold">{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small text-muted">Invoice Number</label>
                      <input type="text" className="form-control bg-light" value={editingInvoice ? formData.invoiceNumber : "Auto-Generated"} readOnly />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted">Client Name</label>
                      <input type="text" className="form-control" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Amount</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input type="number" step="0.01" className="form-control" value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} required />
                      </div>
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Status</label>
                      <select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted">Due Date</label>
                      <input type="date" className="form-control" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0">
                  <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">{editingInvoice ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow">
              <div className="modal-body text-center p-4">
                <div className="mb-3 text-danger">
                  <i className="bi bi-exclamation-octagon" style={{ fontSize: '3rem' }}></i>
                </div>
                <h5 className="mb-2">Are you sure?</h5>
                <p className="text-muted small">
                  You are about to delete invoice <strong>{invoiceToDelete?.invoiceNumber}</strong>. This action cannot be undone.
                </p>
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button className="btn btn-light px-3" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                  <button className="btn btn-danger px-3" onClick={handleDelete}>Delete Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const res = await fetch('http://localhost:5085/api/Invoices');
    const result = await res.json();
    return { props: { initialInvoices: result.success ? result.data : [] } };
  } catch {
    return { props: { initialInvoices: [] } };
  }
}

export default Invoices;