# 🎟️ BK Arena - Blockchain Event Ticketing System

A decentralized application (DApp) for secure and transparent event ticketing using blockchain technology.

## 📌 Features

- **Secure Ticket Purchase**: Buy tickets using cryptocurrency (ETH)
- **Unique Digital Tickets**: Each ticket is a unique blockchain asset
- **Ownership Verification**: Verify ticket authenticity on-chain
- **Ticket Transfer**: Securely transfer tickets to other users
- **Fraud Prevention**: Eliminates fake tickets and unauthorized resale
- **Ticket Validation**: Event organizers can mark tickets as used

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite)
- **Smart Contracts**: Solidity
- **Blockchain Framework**: Hardhat
- **Web3 Library**: Ethers.js
- **Wallet**: MetaMask
- **Test Network**: Sepolia

## 📁 Project Structure

```
bk-arena-tickets/
├── backend/
│   ├── contracts/
│   │   └── BKEventTickets.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   │   └── BKEventTickets.js
│   └── hardhat.config.cjs
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Ticket.jsx
│   │   ├── styles/
│   │   │   └── Ticket.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Sepolia testnet ETH (get from faucet)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your credentials to `.env`:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_wallet_private_key_here
```

4. Compile contracts:
```bash
npx hardhat compile
```

5. Run tests:
```bash
npx hardhat test
```

6. Deploy to local network:
```bash
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

7. Deploy to Sepolia:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Update contract address in `src/App.jsx`:
```javascript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## 📝 Smart Contract Functions

### User Functions
- `purchaseTicket(eventName, price)` - Buy a new ticket
- `transferTicket(ticketId, recipient)` - Transfer ticket to another address
- `getTicket(ticketId)` - Get ticket details
- `getUserTickets(address)` - Get all tickets owned by an address
- `verifyTicketOwnership(ticketId, owner)` - Verify ticket ownership

### Admin Functions
- `validateTicket(ticketId)` - Mark ticket as used
- `withdraw()` - Withdraw contract balance

## 🔐 Security Features

- Smart contract-based validation
- Prevention of duplicate ticket issuance
- Ownership tracking via wallet addresses
- Cannot reuse validated tickets
- Secure payment handling

## 🧪 Testing

Run the test suite:
```bash
cd backend
npx hardhat test
```

## 📱 Usage

1. **Connect Wallet**: Click "Connect MetaMask Wallet"
2. **Purchase Ticket**: Enter event name and price, then click "Purchase Ticket"
3. **View Tickets**: See all your tickets in the "My Tickets" section
4. **Transfer Ticket**: Click "Transfer Ticket" and enter recipient address
5. **Verify Ownership**: Ticket ownership is automatically verified on-chain

## 🌍 Real-World Application

This system can be deployed for venues like BK Arena in Rwanda to:
- Reduce ticket fraud
- Improve customer trust
- Streamline event management
- Enable digital transformation

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
