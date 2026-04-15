import { useState } from 'react';
import '../styles/Ticket.css';

function Ticket({ ticket, onTransfer, loading }) {
  const [showTransfer, setShowTransfer] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');

  const handleTransfer = () => {
    if (recipientAddress && recipientAddress.startsWith('0x')) {
      onTransfer(ticket.ticketId, recipientAddress);
      setRecipientAddress('');
      setShowTransfer(false);
    } else {
      alert('Please enter a valid Ethereum address');
    }
  };

  return (
    <div className={`ticket-card ${ticket.isUsed ? 'used' : ''}`}>
      <div className="ticket-header">
        <h3>{ticket.eventName}</h3>
        <span className={`status ${ticket.isUsed ? 'used' : 'valid'}`}>
          {ticket.isUsed ? '✓ Used' : '✓ Valid'}
        </span>
      </div>
      
      <div className="ticket-details">
        <div className="detail-row">
          <span className="label">Ticket ID:</span>
          <span className="value">#{ticket.ticketId}</span>
        </div>
        <div className="detail-row">
          <span className="label">Price:</span>
          <span className="value">{ticket.price} ETH</span>
        </div>
        <div className="detail-row">
          <span className="label">Purchase Date:</span>
          <span className="value">{ticket.purchaseTime}</span>
        </div>
        <div className="detail-row">
          <span className="label">Owner:</span>
          <span className="value address">{ticket.owner.slice(0, 6)}...{ticket.owner.slice(-4)}</span>
        </div>
      </div>

      {!ticket.isUsed && (
        <div className="ticket-actions">
          {!showTransfer ? (
            <button 
              onClick={() => setShowTransfer(true)} 
              className="btn-secondary"
              disabled={loading}
            >
              Transfer Ticket
            </button>
          ) : (
            <div className="transfer-form">
              <input
                type="text"
                placeholder="Recipient address (0x...)"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
              <div className="transfer-buttons">
                <button onClick={handleTransfer} className="btn-primary" disabled={loading}>
                  Confirm
                </button>
                <button onClick={() => setShowTransfer(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Ticket;
