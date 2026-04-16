import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Ticket from './components/Ticket';
import AdminPanel from './components/AdminPanel';
import './App.css';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = [
  "function purchaseTicket(string memory _eventName, uint256 _price) public payable returns (uint256)",
  "function transferTicket(uint256 _ticketId, address _to) public",
  "function validateTicket(uint256 _ticketId) public",
  "function getTicket(uint256 _ticketId) public view returns (tuple(uint256 ticketId, string eventName, uint256 price, address owner, bool isUsed, uint256 purchaseTime))",
  "function getUserTickets(address _user) public view returns (uint256[])",
  "function verifyTicketOwnership(uint256 _ticketId, address _owner) public view returns (bool)",
  "function getTotalTickets() public view returns (uint256)",
  "function admin() public view returns (address)",
  "event TicketPurchased(uint256 indexed ticketId, address indexed buyer, string eventName, uint256 price)",
  "event TicketTransferred(uint256 indexed ticketId, address indexed from, address indexed to)"
];

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userTickets, setUserTickets] = useState([]);
  const [eventName, setEventName] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (account && contract) {
      loadUserTickets();
    }
  }, [account, contract]);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        setMessage('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);

      // Check if connected account is the admin
      try {
        const adminAddress = await contractInstance.admin();
        console.log('Admin address:', adminAddress);
        console.log('Connected account:', accounts[0]);
        const isAdminAccount = adminAddress.toLowerCase() === accounts[0].toLowerCase();
        setIsAdmin(isAdminAccount);
        console.log('Is admin:', isAdminAccount);
      } catch (err) {
        console.error('Error checking admin:', err);
        setIsAdmin(false);
      }

      setMessage('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setMessage('Failed to connect wallet');
    }
  };

  const loadUserTickets = async () => {
    if (!contract || !account) return;

    try {
      console.log('=== LOADING TICKETS ===');
      console.log('Account:', account);
      console.log('Contract:', await contract.getAddress());

      // Query ALL TicketPurchased events
      const allEventsFilter = contract.filters.TicketPurchased();
      const allEvents = await contract.queryFilter(allEventsFilter);
      console.log('ALL Purchase events:', allEvents);
      console.log('Number of events:', allEvents.length);

      // Filter events for this user
      const userEvents = allEvents.filter(event =>
        event.args[1].toLowerCase() === account.toLowerCase()
      );
      console.log('User purchase events:', userEvents);

      if (userEvents.length === 0) {
        setUserTickets([]);
        return;
      }

      const ticketsData = await Promise.all(
        userEvents.map(async (event) => {
          const ticketId = event.args[0];
          console.log('Loading ticket ID:', ticketId.toString());
          try {
            const ticket = await contract.getTicket(ticketId);
            console.log('Ticket data:', ticket);

            if (ticket[3].toLowerCase() === account.toLowerCase()) {
              return {
                ticketId: ticket[0].toString(),
                eventName: ticket[1],
                price: ethers.formatEther(ticket[2]),
                owner: ticket[3],
                isUsed: ticket[4],
                purchaseTime: new Date(Number(ticket[5]) * 1000).toLocaleString()
              };
            }
            return null;
          } catch (err) {
            console.log(`Error loading ticket ${ticketId}:`, err.message);
            return null;
          }
        })
      );

      const validTickets = ticketsData.filter(t => t !== null);
      console.log('Final user tickets:', validTickets);
      setUserTickets(validTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const purchaseTicket = async (e) => {
    e.preventDefault();
    if (!contract) {
      setMessage('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const priceInWei = ethers.parseEther(ticketPrice);
      console.log('Price in Wei:', priceInWei.toString());
      console.log('Event name:', eventName);

      const gasEstimate = await contract.purchaseTicket.estimateGas(
        eventName, priceInWei, { value: priceInWei }
      );
      console.log('Gas estimate:', gasEstimate.toString());

      const tx = await contract.purchaseTicket(eventName, priceInWei, {
        value: priceInWei,
        gasLimit: gasEstimate * 2n
      });
      setMessage('Transaction submitted. Waiting for confirmation...');
      console.log('Transaction hash:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      setMessage('Ticket purchased successfully!');

      setEventName('');
      setTicketPrice('');
      await loadUserTickets();
    } catch (error) {
      console.error('Error purchasing ticket:', error);

      // User-friendly error messages
      if (error.message.includes('insufficient funds') || error.code === 'INSUFFICIENT_FUNDS') {
        setMessage('❌ Insufficient funds. Your wallet does not have enough ETH to cover the ticket price and gas fees.');
      } else if (error.message.includes('user rejected') || error.code === 'ACTION_REJECTED') {
        setMessage('⚠️ Transaction cancelled. You rejected the transaction in MetaMask.');
      } else if (error.message.includes('Only admin')) {
        setMessage('❌ Only the contract admin can perform this action.');
      } else if (error.message.includes('network')) {
        setMessage('❌ Network error. Make sure your MetaMask is connected to the Hardhat local network.');
      } else {
        setMessage('❌ Transaction failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const transferTicket = async (ticketId, recipientAddress) => {
    if (!contract) return;

    if (!ethers.isAddress(recipientAddress)) {
      setMessage('Please enter a valid Ethereum address (0x...)');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.transferTicket(ticketId, recipientAddress);
      setMessage('Transferring ticket...');
      await tx.wait();
      setMessage('Ticket transferred successfully!');
      await loadUserTickets();
    } catch (error) {
      console.error('Error transferring ticket:', error);

      if (error.message.includes('insufficient funds') || error.code === 'INSUFFICIENT_FUNDS') {
        setMessage('❌ Insufficient funds to cover gas fees for this transfer.');
      } else if (error.message.includes('user rejected') || error.code === 'ACTION_REJECTED') {
        setMessage('⚠️ Transfer cancelled. You rejected the transaction in MetaMask.');
      } else if (error.message.includes('not the ticket owner')) {
        setMessage('❌ You are not the owner of this ticket.');
      } else if (error.message.includes('Cannot transfer used ticket')) {
        setMessage('❌ This ticket has already been used and cannot be transferred.');
      } else {
        setMessage('❌ Transfer failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎟️ BK Arena Ticketing System</h1>
        <p>Secure blockchain-based event tickets</p>
      </header>

      <div className="container">
        {!account ? (
          <div className="connect-section">
            <button onClick={connectWallet} className="btn-primary">
              Connect MetaMask Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="account-info">
              <p>
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
                {isAdmin && <span className="admin-badge">🛡️ Admin</span>}
              </p>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
                onClick={() => setActiveTab('tickets')}
              >
                🎟️ My Tickets
              </button>
              {isAdmin && (
                <button
                  className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  🛡️ Admin Panel
                </button>
              )}
            </div>

            {activeTab === 'tickets' && (
              <>
                <div className="purchase-section">
                  <h2>Purchase Ticket</h2>
                  <form onSubmit={purchaseTicket}>
                    <input
                      type="text"
                      placeholder="Event Name (e.g., BK Arena Concert)"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Price in ETH (e.g., 0.1)"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      required
                    />
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? 'Processing...' : 'Purchase Ticket'}
                    </button>
                  </form>
                </div>

                {message && <div className="message">{message}</div>}

                <div className="tickets-section">
                  <h2>My Tickets ({userTickets.length})</h2>
                  <div className="tickets-grid">
                    {userTickets.length === 0 ? (
                      <p>No tickets yet. Purchase your first ticket above!</p>
                    ) : (
                      userTickets.map((ticket) => (
                        <Ticket
                          key={ticket.ticketId}
                          ticket={ticket}
                          onTransfer={transferTicket}
                          loading={loading}
                        />
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'admin' && isAdmin && (
              <AdminPanel contract={contract} account={account} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
