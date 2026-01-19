import { useState, useEffect } from 'react';
import styles from '../../../styles/Invoices.module.css';
import { notify } from '../../../utils/notify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, faEdit, faTrashAlt, faPlus, faCalendarCheck, 
    faFileInvoiceDollar, faUserTag, faCreditCard, faMoneyBillWave, faUsers 
} from '@fortawesome/free-solid-svg-icons';

const InvoicesComponent = ({ user, initialInvoices }) => {
    const [invoices, setInvoices] = useState(initialInvoices || []);
    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAllClients, setShowAllClients] = useState(false); // Toggle for walk-ins

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [editingInvoiceId, setEditingInvoiceId] = useState(null);
    const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);

    const [newInvoice, setNewInvoice] = useState({
        clientId: '',
        appointmentId: '',
        paymentMethod: 'Cash', 
        discount: 0,
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

            const urlParams = new URLSearchParams(window.location.search);
            const apptId = urlParams.get('appointmentId');
            const cId = urlParams.get('clientId');

            if (apptId || cId) {
                setNewInvoice(prev => ({
                    ...prev,
                    clientId: cId || '',
                    appointmentId: apptId || ''
                }));
                if (apptId) setShowAddModal(true);
            }
            setLoading(false);
        };
        loadInitialData();
    }, []);

    // --- FILTERS ---
    const todayStr = new Date().toISOString().split('T')[0];

    // Get clients who have an appointment today
    const todaysClients = clients.filter(client => 
        appointments.some(appt => 
            appt.clientId === client.id && 
            appt.appointmentDate?.startsWith(todayStr) && 
            appt.status !== 'Cancelled'
        )
    );

    // Final list based on toggle
    const clientOptions = showAllClients ? clients : todaysClients;

    // --- API CALLS ---
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

    // --- HANDLERS ---
    const handleClientChange = (selectedClientId) => {
        setNewInvoice(prev => ({
            ...prev,
            clientId: selectedClientId,
            appointmentId: '', 
            items: [{ description: '', quantity: 1, unitPrice: 0 }]
        }));

        if (!selectedClientId) return;

        const clientAppt = appointments.find(a => 
            a.clientId.toString() === selectedClientId.toString() &&
            a.appointmentDate?.startsWith(todayStr) &&
            (a.status !== 'Cancelled')
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
            notify.success(`Linked to Today's Appointment #${clientAppt.id}`);
        }
    };

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

    const calculateSubtotal = () => {
        return newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = parseFloat(newInvoice.discount) || 0;
        return Math.max(0, subtotal - discount); 
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        if (!newInvoice.clientId) return notify.error("Please select a client");

        const payload = {
            clientId: parseInt(newInvoice.clientId),
            appointmentId: newInvoice.appointmentId ? parseInt(newInvoice.appointmentId) : null,
            paymentMethod: newInvoice.paymentMethod,
            discount: parseFloat(newInvoice.discount) || 0, 
            items: newInvoice.items.map(item => ({
                description: item.description,
                quantity: parseInt(item.quantity),
                unitPrice: parseFloat(item.unitPrice)
            }))
        };

        const isEditing = !!editingInvoiceId;
        const url = isEditing 
            ? `http://localhost:5085/api/Invoices/${editingInvoiceId}` 
            : 'http://localhost:5085/api/Invoices';

        notify.loading(isEditing ? "Updating Invoice..." : "Finalizing Checkout...");

        try {
            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}` 
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            notify.dismiss();

            if (result.success) {
                notify.success(isEditing ? "Invoice Updated!" : "Checkout Successful!");
                setShowAddModal(false);
                setEditingInvoiceId(null);
                setNewInvoice({ clientId: '', appointmentId: '', paymentMethod: 'Cash', discount: 0, items: [{ description: '', quantity: 1, unitPrice: 0 }] });
                fetchInvoices();
                fetchAppointments(); 
            }
        } catch (error) {
            notify.dismiss();
            notify.error("Connection error");
        }
    };

    const handleEditClick = (inv) => {
        setEditingInvoiceId(inv.id);
        setShowAllClients(true); // Ensure client is visible if editing old invoice
        setNewInvoice({
            clientId: inv.clientId.toString(),
            appointmentId: inv.appointmentId ? inv.appointmentId.toString() : '',
            paymentMethod: inv.paymentMethod,
            discount: inv.discount || 0,
            items: inv.items.map(i => ({ 
                description: i.description, 
                quantity: i.quantity, 
                unitPrice: i.unitPrice 
            }))
        });
        setShowAddModal(true);
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
                notify.success(`Status updated to ${nextStatus}`);
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
                <h3 className="fw-bold">Billing & Invoices</h3>
                <div className="d-flex gap-2 w-50">
                    <input 
                        type="text" 
                        className="form-control shadow-sm" 
                        placeholder="Search by invoice # or client..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary text-nowrap" onClick={() => {
                        setEditingInvoiceId(null);
                        setShowAllClients(false); // Reset to today's view for new invoices
                        setNewInvoice({ clientId: '', appointmentId: '', paymentMethod: 'Cash', discount: 0, items: [{ description: '', quantity: 1, unitPrice: 0 }] });
                        setShowAddModal(true);
                    }}>
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
                                    <th>Method</th>
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
                                            <div className="small text-muted">{new Date(inv.issueDate).toLocaleDateString()}</div>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {inv.paymentMethod === 'Card' ? <FontAwesomeIcon icon={faCreditCard} className="me-1"/> : <FontAwesomeIcon icon={faMoneyBillWave} className="me-1"/>}
                                                {inv.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="fw-bold">${inv.totalAmount.toFixed(2)}</td>
                                        <td style={{ cursor: 'pointer' }} onClick={() => handleUpdateStatus(inv.id, inv.status)}>
                                            <span className={inv.status === 'Paid' ? styles.statusPaid : styles.statusPending}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEditClick(inv)}>
                                                <FontAwesomeIcon icon={faEdit} /> 
                                            </button>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setSelectedInvoice(inv)}>
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => setDeletingInvoiceId(inv.id)}>
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

            {/* CREATE / EDIT INVOICE MODAL */}
            {showAddModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <form onSubmit={handleCreateInvoice}>
                                <div className="modal-header bg-light">
                                    <h5 className="fw-bold mb-0">{editingInvoiceId ? 'Edit Invoice' : 'Checkout & Invoice'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row mb-4 align-items-end">
                                        <div className="col-md-6">
                                            <div className="d-flex justify-content-between">
                                                <label className="form-label fw-bold">Select Client</label>
                                                <div className="form-check form-switch small">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        checked={showAllClients} 
                                                        onChange={() => setShowAllClients(!showAllClients)}
                                                    />
                                                    <label className="form-check-label text-muted">Show All</label>
                                                </div>
                                            </div>
                                            <select 
                                                className="form-select border-2" 
                                                required
                                                value={newInvoice.clientId}
                                                onChange={(e) => handleClientChange(e.target.value)}
                                            >
                                                <option value="">-- {clientOptions.length > 0 ? 'Choose Client' : 'No clients found'} --</option>
                                                {clientOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Payment Method</label>
                                            <select 
                                                className="form-select border-2"
                                                value={newInvoice.paymentMethod}
                                                onChange={(e) => setNewInvoice({...newInvoice, paymentMethod: e.target.value})}
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Card">Credit/Debit Card</option>
                                                <option value="Transfer">Bank Transfer</option>
                                            </select>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="text-center pb-2">
                                                {newInvoice.appointmentId ? (
                                                    <span className="badge bg-success-subtle text-success border border-success w-100 p-2">Linked</span>
                                                ) : (
                                                    <span className="badge bg-secondary-subtle text-secondary border border-secondary w-100 p-2">Manual</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label fw-bold mb-0">Services / Items</label>
                                        <button type="button" className="btn btn-sm btn-primary" onClick={handleAddItem}>
                                            <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Item
                                        </button>
                                    </div>
                                    
                                    <div className="table-responsive">
                                        <table className="table table-sm border">
                                            <thead className="table-light">
                                                <tr className="small text-muted">
                                                    <th className="ps-3">Service Quick Pick</th>
                                                    <th>Description</th>
                                                    <th style={{width: '100px'}}>Price</th>
                                                    <th style={{width: '50px'}}></th>
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
                                                                <option value="">-- Select --</option>
                                                                {services.map(s => (
                                                                    <option key={s.id} value={s.id}>{s.name} ({s.price})</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input type="text" className="form-control form-control-sm border-0" placeholder="Description" required
                                                                value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                                                        </td>
                                                        <td>
                                                            <input type="number" step="0.01" className="form-control form-control-sm border-0 fw-bold" required
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

                                    <div className="row justify-content-end mt-3">
                                        <div className="col-md-5">
                                            <div className="d-flex justify-content-between mb-1 small">
                                                <span>Subtotal:</span>
                                                <span>${calculateSubtotal().toFixed(2)}</span>
                                            </div>
                                            <div className="input-group input-group-sm mb-2">
                                                <span className="input-group-text bg-white fw-bold text-danger">Discount</span>
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    value={newInvoice.discount} 
                                                    onChange={(e) => setNewInvoice({...newInvoice, discount: e.target.value})}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="text-end p-3 bg-light rounded border">
                                                <span className="text-muted me-3">Grand Total:</span>
                                                <span className="h4 fw-bold text-primary">${calculateTotal().toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success px-5 fw-bold">
                                        {editingInvoiceId ? 'Save Changes' : 'Complete & Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW/PRINT RECEIPT MODAL */}
            {selectedInvoice && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-md modal-dialog-centered">
                        <div className={`modal-content ${styles.receiptCard} print-section`}>
                            
                            <div className={`modal-header ${styles.receiptHeaderNoBorder} no-print`}>
                                <button type="button" className="btn-close" onClick={() => setSelectedInvoice(null)}></button>
                            </div>

                            <div className={styles.receiptBody}>
                                <div className={styles.receiptBrandSection}>
                                    <div className={styles.brandInfo}>
                                        <h2 className={styles.businessName}>My Salon</h2>
                                        <p className={styles.businessAddress}>123 Beauty Lane, Suite 400<br/>Contact: +1 (555) 000-1111</p>
                                    </div>
                                    <div className={styles.receiptBadge}>
                                        <span className={selectedInvoice.status === 'Paid' ? styles.paidBadge : styles.pendingBadge}>
                                            {selectedInvoice.status}
                                        </span>
                                    </div>
                                </div>

                                <hr className={styles.receiptDivider} />

                                <div className={styles.receiptMetaGrid}>
                                    <div className={styles.metaColumn}>
                                        <span className={styles.metaLabel}>BILLED TO</span>
                                        <div className={styles.metaValueBold}>{selectedInvoice.client?.name}</div>
                                        <div className={styles.metaValue}>{selectedInvoice.client?.phone}</div>
                                    </div>
                                    <div className={`${styles.metaColumn} text-end`}>
                                        <span className={styles.metaLabel}>INVOICE DETAILS</span>
                                        <div className={styles.metaValue}><strong>ID:</strong> {selectedInvoice.invoiceNumber}</div>
                                        <div className={styles.metaValue}><strong>Date:</strong> {new Date(selectedInvoice.issueDate).toLocaleDateString()}</div>
                                        <div className={styles.metaValue}><strong>Method:</strong> {selectedInvoice.paymentMethod}</div>
                                    </div>
                                </div>

                                <table className={styles.receiptTable}>
                                    <thead>
                                        <tr>
                                            <th>Service Description</th>
                                            <th className="text-end">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.description}</td>
                                                <td className="text-end">${item.unitPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className={styles.receiptSummary}>
                                    <div className={styles.summaryRow}>
                                        <span>Subtotal</span>
                                        <span>${(selectedInvoice.totalAmount + (selectedInvoice.discount || 0)).toFixed(2)}</span>
                                    </div>
                                    
                                    {selectedInvoice.discount > 0 && (
                                        <div className={`${styles.summaryRow} ${styles.discountText}`}>
                                            <span>Discount Applied</span>
                                            <span>-${selectedInvoice.discount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className={styles.totalRow}>
                                        <span>Total Amount</span>
                                        <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className={styles.receiptFooter}>
                                    <p>Thank you for choosing My Salon!</p>
                                    <small>Please keep this receipt for your records.</small>
                                </div>
                            </div>

                            <div className="modal-footer border-0 no-print">
                                <button className={styles.printBtn} onClick={() => window.print()}>
                                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                                    Print Official Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL Placeholder */}
            {deletingInvoiceId && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
                    <div className="modal-dialog modal-sm modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-body text-center p-4">
                                <h5 className="mb-3">Delete Invoice?</h5>
                                <p className="text-muted small">This action cannot be undone.</p>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button className="btn btn-light" onClick={() => setDeletingInvoiceId(null)}>Cancel</button>
                                    <button className="btn btn-danger" onClick={handleDeleteInvoice}>Delete</button>
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