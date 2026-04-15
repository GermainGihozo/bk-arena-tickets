import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../styles/AdminPanel.css';

function AdminPanel({ contract, account }) {
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [stats, setStats] = useState({ total: 0, used: 0, valid: 0 });

  useEffect(() => {
    if (contract) {
      loadAllTickets();
    }
  }, [contract]);

  const loadAllTickets = async () => {
    setLoading(true);
    try {
      // Use TicketPurchased events to get all tickets
      const filter = contract.filters.TicketPurchased();
      const events = await contract.queryFilter(filter);

      const ticketsData = await Promise.all(
        events.map(async (event) => {
          const ticketId = event.args[0];
          try {
            const ticket = await contract.getTicket(ticketId);
            return {
              ticketId: ticket[0].toString(),
              eventName: ticket[1],
              price: ethers.formatEther(ticket[2]),
              owner: ticket[3],
              isUsed: ticket[4],
              purchaseTime: new Date(Number(ticket[5]) * 1000).toLocaleString()
            };
          } catch {
            return null;
          }
        })
      );

      const valid = ticketsData.filter((t) => t !== null);
      setAllTickets(valid);
      setStats({
        total: valid.length,
        used: valid.filter((t) => t.isUsed).length,
        valid: valid.filter((t) => !t.isUsed).length
      });
    } catch (error) {
      console.error('Error loading all tickets:', error);
      setMessage('Error loading tickets: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateTicket = async (ticketId) => {
    setLoading(true);
    setMessage('');
    try {
      const tx = await contract.validateTicket(ticketId);
      setMessage(`Validating ticket #${ticketId}...`);
      await tx.wait();
      setMessage(`✅ Ticket #${ticketId} validated successfully!`);
      await loadAllTickets();
      // Update search result if it matches
      if (searchResult && searchResult.ticketId === ticketId.toString()) {
        setSearchResult({ ...searchResult, isUsed: true });
      }
    } catch (error) {
      console.error('Error validating ticket:', error);
      if (error.message.includes('Only admin')) {
        setMessage('❌ Only the contract admin can validate tickets.');
      } else if (error.message.includes('already used')) {
        setMessage(`❌ Ticket #${ticketId} has already been used.`);
      } else {
        setMessage('❌ Failed to validate: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const searchTicket = async (e) => {
    e.preventDefault();
    if (!searchId) return;
    setLoading(true);
    setSearchResult(null);
    setMessage('');
    try {
      const ticket = await contract.getTicket(searchId);
      setSearchResult({
        ticketId: ticket[0].toString(),
        eventName: ticket[1],
        price: ethers.formatEther(ticket[2]),
        owner: ticket[3],
        isUsed: ticket[4],
        purchaseTime: new Date(Number(ticket[5]) * 1000).toLocaleString()
      });
    } catch (error) {
      setMessage('❌ Ticket not found or does not exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🛡️ Admin Panel</h2>
        <p>Ticket Validation & Management</p>
        <button onClick={loadAllTickets} className="btn-refresh" disabled={loading}>
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card total">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Tickets</span>
        </div>
        <div className="stat-card valid">
          <span className="stat-number">{stats.valid}</span>
          <span className="stat-label">Valid Tickets</span>
        </div>
        <div className="stat-card used">
          <span className="stat-number">{stats.used}</span>
          <span className="stat-label">Used Tickets</span>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.startsWith('✅') ? 'success' : message.startsWith('❌') ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      {/* Search Ticket */}
      <div className="search-section">
        <h3>🔍 Search & Validate Ticket</h3>
        <form onSubmit={searchTicket} className="search-form">
          <input
            type="number"
            placeholder="Enter Ticket ID (e.g., 1)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            min="1"
            required
          />
          <button type="submit" className="btn-search" disabled={loading}>
            Search
          </button>
        </form>

        {searchResult && (
          <div className={`search-result ${searchResult.isUsed ? 'used' : 'valid'}`}>
            <div className="result-header">
              <h4>Ticket #{searchResult.ticketId}</h4>
              <span className={`badge ${searchResult.isUsed ? 'badge-used' : 'badge-valid'}`}>
                {searchResult.isUsed ? '✓ Used' : '✓ Valid'}
              </span>
            </div>
            <div className="result-details">
              <div className="result-row">
                <span>Event:</span>
                <strong>{searchResult.eventName}</strong>
              </div>
              <div className="result-row">
                <span>Owner:</span>
                <strong className="address">{searchResult.owner.slice(0, 10)}...{searchResult.owner.slice(-6)}</strong>
              </div>
              <div className="result-row">
                <span>Price:</span>
                <strong>{searchResult.price} ETH</strong>
              </div>
              <div className="result-row">
                <span>Purchased:</span>
                <strong>{searchResult.purchaseTime}</strong>
              </div>
            </div>
            {!searchResult.isUsed && (
              <button
                onClick={() => validateTicket(searchResult.ticketId)}
                className="btn-validate"
                disabled={loading}
              >
                {loading ? 'Validating...' : '✅ Mark as Used'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* All Tickets Table */}
      <div className="all-tickets-section">
        <h3>📋 All Tickets</h3>
        {allTickets.length === 0 ? (
          <p className="no-tickets">No tickets found.</p>
        ) : (
          <div className="tickets-table-wrapper">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event</th>
                  <th>Owner</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allTickets.map((ticket) => (
                  <tr key={ticket.ticketId} className={ticket.isUsed ? 'row-used' : 'row-valid'}>
                    <td>#{ticket.ticketId}</td>
                    <td>{ticket.eventName}</td>
                    <td className="address-cell">
                      {ticket.owner.slice(0, 6)}...{ticket.owner.slice(-4)}
                    </td>
                    <td>{ticket.price} ETH</td>
                    <td>
                      <span className={`badge ${ticket.isUsed ? 'badge-used' : 'badge-valid'}`}>
                        {ticket.isUsed ? 'Used' : 'Valid'}
                      </span>
                    </td>
                    <td>
                      {!ticket.isUsed ? (
                        <button
                          onClick={() => validateTicket(ticket.ticketId)}
                          className="btn-validate-sm"
                          disabled={loading}
                        >
                          Validate
                        </button>
                      ) : (
                        <span className="validated-text">✓ Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
