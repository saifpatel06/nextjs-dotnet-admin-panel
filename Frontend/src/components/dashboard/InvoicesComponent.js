import { useState, useEffect } from 'react';
import styles from '../../../styles/Invoices.module.css';
import { notify } from '../../../utils/notify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrashAlt, faPlus, faCalendarCheck, faFileInvoiceDollar, faUserTag } from '@fortawesome/free-solid-svg-icons';

const InvoicesComponent = ({ user, initialInvoices }) => {
    const [invoices, setInvoices] = useState(initialInvoices || []);
    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);

    const [newInvoice, setNewInvoice] = useState({
        clientId: '',
        appointmentId: '',
        items: [{ description: '', quantity: 1, unitPrice: 0 }]
    });

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await Promise.all([
                fetchInvoices(),
                fetchClients(),
                fetchServices(),
                fetchAppointments()
            ]);

            // URL PARAMETER LOGIC: Handle direct links from Appointments Page
            const urlParams = new URLSearchParams(window.location.search);
            const apptId = urlParams.get('appointmentId');
            const cId = urlParams.get('clientId');

            if (apptId || cId) {
                setNewInvoice(prev => ({
                    ...prev,
                    clientId: cId || '',
                    appointmentId: apptId || ''
                }));
                if (apptId) {
                    // We need to wait for appointments to load to auto-fill items
                    // This logic is handled by a secondary check or by ensuring fetchAppointments is done
                    setShowAddModal(true);
                }
            }
            setLoading(false);
        };

        loadInitialData();
    }, []);

    // --- AUTO-FILL LOGIC ---
    const handleClientChange = (selectedClientId) => {
        // Update client ID and reset items/appt link
        setNewInvoice(prev => ({
            ...prev,
            clientId: selectedClientId,
            appointmentId: '', 
            items: [{ description: '', quantity: 1, unitPrice: 0 }]
        }));

        if (!selectedClientId) return;

        // Find if this client has an appointment (filtering for confirmed/pending)
        const clientAppt = appointments.find(a => 
            a.clientId.toString() === selectedClientId.toString() &&
            (a.status !== 'Cancelled' && a.status !== 'Completed')
        );

        if (clientAppt) {
            setNewInvoice(prev => ({
                ...prev,
                appointmentId: clientAppt.id,
                items: [{ 
                    description: clientAppt.serviceName || "Service Rendered", 
                    quantity: 1, 
                    unitPrice: clientAppt.price || 0 
                }]
            }));
            notify.success(`Linked to Appointment #${clientAppt.id}`);
        }
    };

    // --- API FETCHERS ---
    const fetchInvoices = async () => {
        try {
            const res = await fetch('http://localhost:5085/api/Invoices', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const result = await res.json();
            if (result.success) setInvoices(result.data);
        } catch (error) { notify.error("Failed to load invoices"); }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch('http://localhost:5085/api/Clients', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const result = await res.json();
            if (result.success) setClients(result.data);
        } catch (error) { console.error("Error fetching clients", error); }
    };

    const fetchServices = async () => {
        try {
            const res = await fetch('http://localhost:5085/api/Services', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const result = await res.json();
            if (result.success) setServices(result.data);
        } catch (error) { console.error("Error fetching services", error); }
    };

    const fetchAppointments = async () => {
        try {
            const res = await fetch('http://localhost:5085/api/Appointments', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const result = await res.json();
            if (result.success) setAppointments(result.data);
        } catch (error) { console.error("Error fetching appointments", error); }
    };

    // --- ITEM MANAGEMENT ---
    const handleAddItem = () => {
        setNewInvoice({
            ...newInvoice,
            items: [...newInvoice.items, { description: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const updatedItems = newInvoice.items.filter((_, i) => i !== index);
        setNewInvoice({ ...newInvoice, items: updatedItems });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newInvoice.items];
        if (field === 'serviceSelect') {
            const selectedService = services.find(s => s.id.toString() === value);
            if (selectedService) {
                updatedItems[index].description = selectedService.name;
                updatedItems[index].unitPrice = selectedService.price;
            }
        } else {
            updatedItems[index][field] = value;
        }
        setNewInvoice({ ...newInvoice, items: updatedItems });
    };

    const calculateTotal = () => {
        return newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    // --- CREATE INVOICE ---
    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        if (!newInvoice.clientId) return notify.error("Please select a client");

        const payload = {
            clientId: parseInt(newInvoice.clientId),
            appointmentId: newInvoice.appointmentId ? parseInt(newInvoice.appointmentId) : null,
            items: newInvoice.items.map(item => ({
                description: item.description,
                quantity: parseInt(item.quantity),
                unitPrice: parseFloat(item.unitPrice)
            }))
        };

        notify.loading("Generating invoice...");
        try {
            const res = await fetch('http://localhost:5085/api/Invoices', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}` 
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            notify.dismiss();
            if (result.success) {
                notify.success("Invoice created successfully!");
                setShowAddModal(false);
                setNewInvoice({ clientId: '', appointmentId: '', items: [{ description: '', quantity: 1, unitPrice: 0 }] });
                fetchInvoices();
            }
        } catch (error) {
            notify.dismiss();
            notify.error("Connection error");
        }
    };

    const handleUpdateStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Pending' ? 'Paid' : 'Pending';
        notify.loading("Updating status...");
        try {
            const res = await fetch(`http://localhost:5085/api/Invoices/${id}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}` 
                },
                body: JSON.stringify(nextStatus)
            });
            if (res.ok) {
                notify.dismiss();
                notify.success(`Status: ${nextStatus}`);
                fetchInvoices();
            }
        } catch (error) {
            notify.dismiss();
            notify.error("Update failed");
        }
    };

    const handleDeleteInvoice = async () => {
        if (!deletingInvoiceId) return;
        notify.loading("Deleting invoice...");
        try {
            const res = await fetch(`http://localhost:5085/api/Invoices/${deletingInvoiceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            if (res.ok) {
                notify.dismiss();
                notify.success("Invoice deleted");
                setDeletingInvoiceId(null);
                fetchInvoices();
            }
        } catch (error) {
            notify.dismiss();
            notify.error("Connection error");
        }
    };

    const filteredInvoices = invoices.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.content}>
            <div className={styles.actionBar}>
                <h3 className="fw-bold">Invoices</h3>
                <div className="d-flex gap-2 w-50">
                    <input 
                        type="text" 
                        className="form-control shadow-sm" 
                        placeholder="Search invoices..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary text-nowrap" onClick={() => setShowAddModal(true)}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> New Invoice
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm mt-4">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Invoice #</th>
                                    <th>Client</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5">Loading invoices...</td></tr>
                                ) : filteredInvoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="ps-4 fw-bold text-primary">{inv.invoiceNumber}</td>
                                        <td>
                                            <div className="fw-bold">{inv.client?.name}</div>
                                            <div className="small text-muted">{inv.client?.email}</div>
                                        </td>
                                        <td>{new Date(inv.issueDate).toLocaleDateString()}</td>
                                        <td className="fw-bold">${inv.totalAmount.toFixed(2)}</td>
                                        <td>
                                            <span className={inv.status === 'Paid' ? styles.statusPaid : styles.statusPending}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className={`btn btn-sm me-2 ${inv.status === 'Pending' ? 'btn-success' : 'btn-outline-secondary'}`}
                                                onClick={() => handleUpdateStatus(inv.id, inv.status)}
                                            >
                                                {inv.status === 'Pending' ? 'Mark Paid' : 'Set Pending'}
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => setSelectedInvoice(inv)}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => setDeletingInvoiceId(inv.id)}
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* CREATE INVOICE MODAL */}
            {showAddModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <form onSubmit={handleCreateInvoice}>
                                <div className="modal-header bg-light">
                                    <h5 className="fw-bold mb-0">Create New Invoice</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Select Client</label>
                                            <select 
                                                className="form-select border-2" 
                                                required
                                                value={newInvoice.clientId}
                                                onChange={(e) => handleClientChange(e.target.value)}
                                            >
                                                <option value="">-- Choose Client --</option>
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Invoice Type</label>
                                            <div className="d-flex align-items-center h-100 mt-1">
                                                {newInvoice.appointmentId ? (
                                                    <span className="badge bg-success-subtle text-success border border-success px-3 py-2">
                                                        <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                                                        Linked to Appt #{newInvoice.appointmentId}
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-secondary-subtle text-secondary border border-secondary px-3 py-2">
                                                        <FontAwesomeIcon icon={faUserTag} className="me-2" />
                                                        Manual / Walk-in
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label fw-bold mb-0">Services & Products</label>
                                        <button type="button" className="btn btn-sm btn-primary" onClick={handleAddItem}>
                                            <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Row
                                        </button>
                                    </div>
                                    
                                    <div className="table-responsive">
                                        <table className="table table-sm border">
                                            <thead className="table-light">
                                                <tr className="small text-muted">
                                                    <th className="ps-3" style={{width: '200px'}}>Select Service</th>
                                                    <th>Description</th>
                                                    <th style={{width: '80px'}}>Qty</th>
                                                    <th style={{width: '120px'}}>Price</th>
                                                    <th style={{width: '50px'}} className="text-center"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {newInvoice.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="ps-2">
                                                            <select 
                                                                className="form-select form-select-sm border-0"
                                                                onChange={(e) => handleItemChange(index, 'serviceSelect', e.target.value)}
                                                            >
                                                                <option value="">-- Quick Pick --</option>
                                                                {services.map(s => (
                                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input type="text" className="form-control form-control-sm border-0" placeholder="Description" required
                                                                value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                                                        </td>
                                                        <td>
                                                            <input type="number" className="form-control form-control-sm border-0 text-center" min="1" required
                                                                value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                                                        </td>
                                                        <td>
                                                            <input type="number" step="0.01" className="form-control form-control-sm border-0" required
                                                                value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} />
                                                        </td>
                                                        <td className="text-center">
                                                            <button type="button" className="btn btn-link text-danger p-0" onClick={() => handleRemoveItem(index)}>
                                                                <FontAwesomeIcon icon={faTrashAlt} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="text-end mt-3 p-3 bg-light rounded">
                                        <span className="text-muted me-3">Grand Total:</span>
                                        <span className="h3 fw-bold text-primary">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-5 fw-bold">Save Invoice</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW RECEIPT MODAL */}
            {selectedInvoice && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-md modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <button type="button" className="btn-close" onClick={() => setSelectedInvoice(null)}></button>
                            </div>
                            <div className="modal-body px-4 pb-4">
                                <div className="text-center mb-4">
                                    <div className="h4 fw-bold text-uppercase mb-1">Receipt</div>
                                    <div className="text-muted small">Invoice #: {selectedInvoice.invoiceNumber}</div>
                                    {selectedInvoice.appointmentId && (
                                        <div className="badge bg-light text-dark border mt-2">
                                            <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                                            Linked to Appointment #{selectedInvoice.appointmentId}
                                        </div>
                                    )}
                                </div>
                                <div className="row mb-4">
                                    <div className="col-6">
                                        <div className="text-muted small">Billed To:</div>
                                        <div className="fw-bold">{selectedInvoice.client?.name}</div>
                                        <div className="small">{selectedInvoice.client?.email}</div>
                                    </div>
                                    <div className="col-6 text-end">
                                        <div className="text-muted small">Date Issued:</div>
                                        <div className="fw-bold">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</div>
                                        <div className={`small fw-bold ${selectedInvoice.status === 'Paid' ? 'text-success' : 'text-warning'}`}>
                                            Status: {selectedInvoice.status}
                                        </div>
                                    </div>
                                </div>
                                <table className="table table-sm border-top border-bottom">
                                    <thead>
                                        <tr className="text-muted small">
                                            <th>Description</th>
                                            <th className="text-center">Qty</th>
                                            <th className="text-end">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="py-2">{item.description}</td>
                                                <td className="py-2 text-center">{item.quantity}</td>
                                                <td className="py-2 text-end">${item.unitPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="d-flex justify-content-between align-items-center mt-3 px-2">
                                    <div className="h5 fw-bold mb-0">Total Amount</div>
                                    <div className="h4 fw-bold text-primary mb-0">${selectedInvoice.totalAmount.toFixed(2)}</div>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-light w-100" onClick={() => window.print()}>Print Receipt</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deletingInvoiceId && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
                    <div className="modal-dialog modal-sm modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-body text-center p-4">
                                <div className="text-danger mb-3">
                                    <FontAwesomeIcon icon={faTrashAlt} size="3x" />
                                </div>
                                <h5 className="fw-bold">Delete Invoice?</h5>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-light flex-fill" onClick={() => setDeletingInvoiceId(null)}>Cancel</button>
                                    <button className="btn btn-danger flex-fill" onClick={handleDeleteInvoice}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicesComponent;