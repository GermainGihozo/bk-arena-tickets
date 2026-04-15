# BK Arena Event Tickets — Project Report

---

## 7. BK Arena Event Tickets

### Project Overview

BK Arena Event Tickets is a blockchain-based decentralized application (DApp) designed to sell digital tickets for events held at BK Arena. The system leverages smart contracts on the Ethereum blockchain to ensure that every ticket is unique, verifiable, and tamper-proof — completely eliminating the possibility of ticket scalping or counterfeiting.

Unlike traditional ticketing systems that rely on centralized databases and paper or PDF tickets that can be duplicated, this system records every ticket on the blockchain. Each ticket is permanently linked to the buyer's wallet address, making ownership transparent and verifiable by anyone at any time.

---

### Problem Statement

Traditional event ticketing systems suffer from several critical issues:

- **Fake tickets** — Fraudsters duplicate PDF or paper tickets and sell them to multiple buyers.
- **Scalping** — Resellers buy tickets in bulk and resell them at inflated prices.
- **No ownership transparency** — There is no reliable way to verify who legitimately owns a ticket.
- **Centralized control** — A single company controls all ticket data, creating a single point of failure.

---

### Solution

The BK Arena Event Tickets DApp solves these problems by:

- Storing every ticket as a unique record on the Ethereum blockchain
- Linking each ticket to the buyer's wallet address (ownership is cryptographically proven)
- Preventing ticket reuse through on-chain validation (once used, a ticket cannot be used again)
- Allowing only the contract admin (event organizer) to validate tickets at the gate
- Enabling secure peer-to-peer ticket transfers without involving a third party

---

### System Features

| Feature | Description |
|---|---|
| Ticket Purchase | Users buy tickets using ETH via MetaMask |
| Unique Ticket ID | Each ticket gets a unique ID stored on-chain |
| Ownership Verification | Anyone can verify who owns a ticket |
| Ticket Transfer | Holders can transfer tickets to other wallet addresses |
| Ticket Validation | Admin marks tickets as "used" to prevent reuse |
| Admin Panel | Dashboard showing all tickets, stats, and validation controls |
| Anti-Scalping | Smart contract logic prevents unauthorized resale |

---

### Technologies Used

| Layer | Technology |
|---|---|
| Smart Contract | Solidity ^0.8.19 |
| Blockchain Framework | Hardhat |
| Frontend | React.js (Vite) |
| Blockchain Interaction | Ethers.js v6 |
| Wallet | MetaMask |
| Test Network | Sepolia Testnet |
| Node Provider | Infura |

---

## 14-Day Development Roadmap

---

### Days 1–4: Logic (Smart Contract Development)

**Goal:** Write and finalize the Solidity smart contract.

**Tools:** Remix IDE or Hardhat, Solidity ^0.8.19

#### Day 1 — Project Setup & Contract Structure

- Set up Hardhat project (`npm install hardhat`)
- Create `BKEventTickets.sol`
- Define the `Ticket` struct:

```solidity
struct Ticket {
    uint256 ticketId;
    string eventName;
    uint256 price;
    address owner;
    bool isUsed;
    uint256 purchaseTime;
}
```

- Define state variables:

```solidity
uint256 private ticketCounter;
address public admin;
mapping(uint256 => Ticket) public tickets;
mapping(address => uint256[]) private userTickets;
```

#### Day 2 — Core Functions

- Implement `purchaseTicket()` with `payable` modifier
- Implement `getTicket()` and `getUserTickets()` view functions
- Implement `getTotalTickets()` for admin dashboard
- Add events: `TicketPurchased`, `TicketTransferred`, `TicketValidated`

#### Day 3 — Access Control & Security

- Implement `Ownable` pattern using a custom `onlyAdmin` modifier:

```solidity
modifier onlyAdmin() {
    require(msg.sender == admin, "Only admin can perform this action");
    _;
}
```

- Implement `onlyTicketOwner` modifier for transfer protection
- Add `validateTicket()` restricted to admin only
- Add `withdraw()` for the admin to collect ETH from ticket sales
- Add `require` checks to prevent:
  - Transferring used tickets
  - Double-validating tickets
  - Insufficient payment

#### Day 4 — Testing Logic Locally

- Write unit tests in `test/BKEventTickets.js` using Chai and Ethers.js
- Test cases to cover:
  - Purchasing a ticket emits `TicketPurchased` event
  - Ticket owner is correctly set after purchase
  - Transfer updates ownership correctly
  - Admin can validate a ticket
  - Non-admin cannot validate (should revert)
  - Used ticket cannot be transferred
- Run tests:

```bash
npx hardhat compile
npx hardhat test
```

Expected output:
```
BKEventTickets
  ✓ Should purchase a ticket
  ✓ Should transfer a ticket
  ✓ Should validate a ticket
3 passing
```

---

### Days 5–8: Testing on Sepolia Testnet

**Goal:** Deploy the contract to Sepolia Testnet and test all functions using fake ETH.

**Tools:** MetaMask, Infura, Sepolia Faucet

#### Day 5 — Infura & MetaMask Setup

**What is Infura?**
Infura is a blockchain node provider that gives your application access to the Ethereum network without running your own node. Instead of downloading the entire Ethereum blockchain (1TB+), Infura provides an API endpoint your app connects to.

```
Your App → Infura API → Sepolia Testnet
```

**Setting up Infura:**

1. Go to [https://infura.io](https://infura.io) and create a free account
2. Create a new project → Select "Web3 API"
3. Copy your API key
4. Create a `.env` file in the backend folder:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
PRIVATE_KEY=your_metamask_wallet_private_key
```

**Setting up MetaMask for Sepolia:**

1. Open MetaMask → Click network dropdown
2. Enable "Show test networks" in Settings → Advanced
3. Select "Sepolia Test Network"
4. Get free test ETH from the Sepolia faucet:
   - [https://sepoliafaucet.com](https://sepoliafaucet.com)
   - [https://faucet.sepolia.dev](https://faucet.sepolia.dev)

**Update `hardhat.config.js`:**

```javascript
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

export default {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

Install dotenv:
```bash
npm install dotenv
```

#### Day 6 — Deploy to Sepolia

Deploy the contract to Sepolia testnet:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Expected output:
```
Deploying BKEventTickets contract...
BKEventTickets deployed to: 0xYourContractAddress
Save this address for frontend integration!
```

- Copy the deployed contract address
- Update `CONTRACT_ADDRESS` in `frontend/src/App.jsx`
- Verify the contract on Etherscan (optional but recommended):

```bash
npx hardhat verify --network sepolia 0xYourContractAddress
```

View your contract at:
```
https://sepolia.etherscan.io/address/0xYourContractAddress
```

#### Day 7 — Test Core Functions on Sepolia

Using the frontend connected to Sepolia, test each function with fake ETH:

**Test 1: Purchase Ticket**
- Connect MetaMask (Sepolia network)
- Enter event name: "BK Arena Concert"
- Enter price: 0.01 ETH
- Click "Purchase Ticket"
- Confirm transaction in MetaMask
- Verify ticket appears in "My Tickets"
- Check transaction on Sepolia Etherscan

**Test 2: Transfer Ticket**
- Click "Transfer Ticket" on an owned ticket
- Enter a recipient wallet address (use Account #1 from MetaMask)
- Confirm transaction
- Switch to recipient account and verify ticket appears

**Test 3: Validate Ticket (Admin)**
- Connect with the deployer wallet (admin account)
- Go to Admin Panel tab
- Search for a ticket by ID
- Click "Mark as Used"
- Verify ticket status changes to "Used"
- Attempt to validate the same ticket again (should fail)

**Test 4: Withdraw (Admin)**
- Connect with admin wallet
- Call `withdraw()` via Hardhat console or add a button in the admin panel
- Verify ETH is transferred to admin wallet

```bash
npx hardhat console --network sepolia
> const contract = await ethers.getContractAt("BKEventTickets", "0xYourAddress")
> await contract.withdraw()
```

#### Day 8 — Bug Fixes & Edge Case Testing

Test edge cases and fix any issues found:

| Test Case | Expected Result |
|---|---|
| Purchase with insufficient ETH | Transaction reverts with "Insufficient payment" |
| Transfer a used ticket | Transaction reverts with "Cannot transfer used ticket" |
| Non-admin calls validateTicket | Transaction reverts with "Only admin" |
| Validate already used ticket | Transaction reverts with "Ticket already used" |
| Transfer to zero address | Transaction reverts with "Invalid recipient address" |
| Get non-existent ticket | Transaction reverts with "Ticket does not exist" |

Run all tests again against Sepolia to confirm:

```bash
npx hardhat test --network sepolia
```

---

### Days 9–14: Frontend, UI Polish & Deployment (Overview)

| Days | Focus |
|---|---|
| 9–10 | Build React frontend with Vite, connect Ethers.js |
| 11–12 | Build Admin Panel, ticket cards, transfer UI |
| 13 | End-to-end testing on Sepolia with real users |
| 14 | Final polish, documentation, demo preparation |

---

### Smart Contract Summary

```solidity
// Key functions in BKEventTickets.sol

purchaseTicket(string _eventName, uint256 _price) payable
// Buys a ticket, stores it on-chain, emits TicketPurchased event

transferTicket(uint256 _ticketId, address _to)
// Transfers ownership to another wallet, only by current owner

validateTicket(uint256 _ticketId)
// Marks ticket as used, only callable by admin

getTicket(uint256 _ticketId) view returns (Ticket)
// Returns full ticket details

getUserTickets(address _user) view returns (uint256[])
// Returns all ticket IDs owned by a user

withdraw()
// Admin withdraws all ETH collected from ticket sales
```

---

### Security Considerations

- **Access Control:** `onlyAdmin` modifier restricts sensitive functions
- **Reentrancy:** `withdraw()` uses direct transfer, no external calls before state change
- **Input Validation:** All `require` statements validate inputs before execution
- **Ownership:** Each ticket is cryptographically tied to a wallet address
- **No Reuse:** Once validated, a ticket's `isUsed` flag is permanently set to `true`

---

### Real-World Impact for BK Arena

| Problem | Solution |
|---|---|
| Fake paper/PDF tickets | Blockchain-verified digital tickets |
| Ticket scalping | Smart contract controls resale |
| Manual gate validation | Admin panel with one-click validation |
| No ownership proof | Wallet address = cryptographic proof |
| Centralized failure risk | Decentralized, no single point of failure |

---

*Document prepared for BK Arena Event Ticketing System — Blockchain DApp Project*
