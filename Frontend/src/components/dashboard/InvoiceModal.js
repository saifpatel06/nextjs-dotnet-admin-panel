import { useState } from 'react';
import { notify } from '../../../utils/notify';

const InvoiceModal = ({ user, data, onClose, onRefresh }) => {
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [loading, setLoading] = useState(false);

    const handleGenerateInvoice = async () => {
        setLoading(true);
        notify.loading("Generating Invoice...");

        try {
            const res = await fetch('http://localhost:5085/api/Invoices', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}` 
                },
                body: JSON.stringify({
                    clientId: parseInt(data.clientId),
                    appointmentId: parseInt(data.appointmentId),
                    paymentMethod: paymentMethod, // e.g., "Cash"
                    // This must be named "Items" to match CreateInvoiceDto.cs
                    items: [
                        {
                            description: data.serviceName,
                            quantity: 1,
                            unitPrice: parseFloat(data.amount)
                        }
                    ]
                })
            });

            const result = await res.json();
            notify.dismiss();

            if (res.ok) {
                notify.success("Invoice Created Successfully!");
                onRefresh(); 
                onClose();   
            } else {
                notify.error(result.message || "Failed to create invoice");
            }
        } catch (err) {
            notify.dismiss();
            notify.error("Connection error to billing system");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title fw-bold">Finalize Billing</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="text-center mb-4">
                            <h2 className="fw-bold text-success">${data.amount}</h2>
                            <p className="text-muted">{data.serviceName} for {data.clientName}</p>
                        </div>
                        
                        <div className="mb-3">
                            <label className="small fw-bold text-muted">PAYMENT METHOD</label>
                            <select 
                                className="form-select form-select-lg mt-1" 
                                value={paymentMethod} 
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="Cash">💵 Cash</option>
                                <option value="Card">💳 Credit/Debit Card</option>
                                <option value="Transfer">🏦 Online Transfer</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer bg-light border-0">
                        <button className="btn btn-light" onClick={onClose}>Cancel</button>
                        <button 
                            className="btn btn-success px-4 fw-bold" 
                            onClick={handleGenerateInvoice}
                            disabled={loading}
                        >
                            Confirm Payment & Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;