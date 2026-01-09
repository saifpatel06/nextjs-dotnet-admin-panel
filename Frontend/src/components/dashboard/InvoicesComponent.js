import { useState, useEffect, useRef } from 'react';
import styles from '../../../styles/Invoices.module.css';

const InvoicesComponent = ({ user, initialInvoices }) => {
  const [invoices, setInvoices] = useState(initialInvoices || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Modals States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const invoiceRef = useRef();

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

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadPDF = () => {
    const html2pdf = require('html2pdf.js');
    const element = invoiceRef.current;
    const opt = {
      margin: 0.5,
      filename: `Invoice_${selectedInvoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

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

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const confirmDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      const res = await fetch(`http://localhost:5085/api/Invoices/${invoiceToDelete.invoiceNumber}`, 
        { 
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${user.token}` } 
        }
      );
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
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
    <div className={styles.content}>
      <div className={styles.actionBar}>
        <input 
          type="text" 
          placeholder="Search by Inv# or Client..." 
          className="form-control w-50 shadow-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Add New Invoice</button>
      </div>

      <div className="card shadow-sm border-0 mt-3">
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
                      <span className={`badge rounded-pill ${inv.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="d-none d-md-table-cell">
                      {isClient ? new Date(inv.dueDate).toLocaleDateString() : ""}
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-info me-2 shadow-sm" onClick={() => handleViewInvoice(inv)}>View</button>
                      <button className="btn btn-sm btn-outline-primary me-2 shadow-sm" onClick={() => handleOpenModal(inv)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => confirmDelete(inv)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- ALL MODALS (VIEW, EDIT, DELETE) STAY HERE --- */}
      {/* (Keep the same Modal code you had previously below) */}
      
      {/* ... View Modal ... */}
      {viewModalOpen && selectedInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          {/* Modal content as before */}
           <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
               <div className="modal-header border-0 pb-0">
                 <h5 className="modal-title fw-bold ms-3 mt-2">Invoice Preview</h5>
                 <button type="button" className="btn-close" onClick={() => setViewModalOpen(false)}></button>
               </div>
               <div className="modal-body p-5">
                 <div ref={invoiceRef} className="p-4 bg-white" style={{ color: '#333' }}>
                    {/* Inner invoice content */}
                    <div className="d-flex justify-content-between mb-5 border-bottom pb-4">
                      <div>
                        <h1 className="fw-bold text-primary mb-0">INVOICE</h1>
                        <p className="text-muted small">No: {selectedInvoice.invoiceNumber}</p>
                      </div>
                      <div className="text-end">
                        <h4 className="fw-bold mb-0">ADMIN PORTAL</h4>
                        <p className="small text-muted mb-0">billing@yourdomain.com</p>
                      </div>
                    </div>
                    {/* ... rest of the preview ... */}
                    <div className="row mb-5">
                       <div className="col-6">
                         <p className="text-muted small text-uppercase fw-bold mb-1">Billed To</p>
                         <h5 className="fw-bold">{selectedInvoice.clientName}</h5>
                       </div>
                       <div className="col-6 text-end">
                         <p className="text-muted small text-uppercase fw-bold mb-1">Due Date</p>
                         <h5 className="fw-bold">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</h5>
                       </div>
                    </div>
                    <table className="table table-bordered mb-4">
                       <thead className="table-light">
                         <tr>
                           <th>Description</th>
                           <th className="text-end" style={{ width: '150px' }}>Total</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           <td className="py-3">Professional Services - {selectedInvoice.invoiceNumber}</td>
                           <td className="text-end py-3">${selectedInvoice.amount.toFixed(2)}</td>
                         </tr>
                       </tbody>
                    </table>
                 </div>
               </div>
               <div className="modal-footer bg-light border-0">
                 <button className="btn btn-secondary px-4" onClick={() => setViewModalOpen(false)}>Close</button>
                 <button className="btn btn-primary px-4" onClick={downloadPDF}>Download PDF</button>
               </div>
            </div>
           </div>
        </div>
      )}

      {/* ... Add/Edit Modal ... */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
           <div className="modal-dialog modal-dialog-centered">
             <div className="modal-content border-0 shadow-lg">
                <form onSubmit={handleSubmit}>
                   <div className="modal-header">
                     <h5 className="modal-title fw-bold">{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</h5>
                     <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                   </div>
                   <div className="modal-body p-4">
                     {/* Form fields same as before */}
                     <div className="mb-3">
                        <label className="form-label small text-muted">Client Name</label>
                        <input type="text" className="form-control" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} required />
                     </div>
                     <div className="row">
                        <div className="col-6 mb-3">
                           <label className="form-label small text-muted">Amount</label>
                           <input type="number" step="0.01" className="form-control" value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} required />
                        </div>
                        <div className="col-6 mb-3">
                           <label className="form-label small text-muted">Status</label>
                           <select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                             <option value="Unpaid">Unpaid</option>
                             <option value="Paid">Paid</option>
                             <option value="Overdue">Overdue</option>
                           </select>
                        </div>
                     </div>
                     <div className="mb-3">
                        <label className="form-label small text-muted">Due Date</label>
                        <input type="date" className="form-control" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
                     </div>
                   </div>
                   <div className="modal-footer bg-light border-0">
                     <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Cancel</button>
                     <button type="submit" className="btn btn-primary px-4">{editingInvoice ? 'Update' : 'Create'}</button>
                   </div>
                </form>
             </div>
           </div>
        </div>
      )}

      {/* ... Delete Modal ... */}
      {deleteModalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
           <div className="modal-dialog modal-dialog-centered modal-sm">
             <div className="modal-content border-0 shadow text-center p-4">
                <h5 className="mb-2">Are you sure?</h5>
                <p className="text-muted small">Delete invoice <strong>{invoiceToDelete?.invoiceNumber}</strong>?</p>
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button className="btn btn-light px-3" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                  <button className="btn btn-danger px-3" onClick={handleDelete}>Delete Now</button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesComponent;