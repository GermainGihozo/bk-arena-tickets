// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BKEventTickets {
    struct Ticket {
        uint256 ticketId;
        string eventName;
        uint256 price;
        address owner;
        bool isUsed;
        uint256 purchaseTime;
    }
    
    uint256 private ticketCounter;
    address public admin;
    
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) private userTickets;
    
    event TicketPurchased(uint256 indexed ticketId, address indexed buyer, string eventName, uint256 price);
    event TicketTransferred(uint256 indexed ticketId, address indexed from, address indexed to);
    event TicketValidated(uint256 indexed ticketId, address indexed validator);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyTicketOwner(uint256 _ticketId) {
        require(tickets[_ticketId].owner == msg.sender, "You are not the ticket owner");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        ticketCounter = 0;
    }
    
    function purchaseTicket(string memory _eventName, uint256 _price) public payable returns (uint256) {
        require(msg.value >= _price, "Insufficient payment");
        
        ticketCounter++;
        
        tickets[ticketCounter] = Ticket({
            ticketId: ticketCounter,
            eventName: _eventName,
            price: _price,
            owner: msg.sender,
            isUsed: false,
            purchaseTime: block.timestamp
        });
        
        userTickets[msg.sender].push(ticketCounter);
        
        emit TicketPurchased(ticketCounter, msg.sender, _eventName, _price);
        
        return ticketCounter;
    }
    
    function transferTicket(uint256 _ticketId, address _to) public onlyTicketOwner(_ticketId) {
        require(!tickets[_ticketId].isUsed, "Cannot transfer used ticket");
        require(_to != address(0), "Invalid recipient address");
        
        address previousOwner = tickets[_ticketId].owner;
        tickets[_ticketId].owner = _to;
        
        _removeTicketFromUser(previousOwner, _ticketId);
        userTickets[_to].push(_ticketId);
        
        emit TicketTransferred(_ticketId, previousOwner, _to);
    }
    
    function validateTicket(uint256 _ticketId) public onlyAdmin {
        require(tickets[_ticketId].ticketId != 0, "Ticket does not exist");
        require(!tickets[_ticketId].isUsed, "Ticket already used");
        
        tickets[_ticketId].isUsed = true;
        
        emit TicketValidated(_ticketId, msg.sender);
    }
    
    function getTicket(uint256 _ticketId) public view returns (Ticket memory) {
        require(tickets[_ticketId].ticketId != 0, "Ticket does not exist");
        return tickets[_ticketId];
    }
    
    function getUserTickets(address _user) public view returns (uint256[] memory) {
        return userTickets[_user];
    }
    
    function verifyTicketOwnership(uint256 _ticketId, address _owner) public view returns (bool) {
        return tickets[_ticketId].owner == _owner && !tickets[_ticketId].isUsed;
    }
    
    function _removeTicketFromUser(address _user, uint256 _ticketId) private {
        uint256[] storage userTicketList = userTickets[_user];
        for (uint256 i = 0; i < userTicketList.length; i++) {
            if (userTicketList[i] == _ticketId) {
                userTicketList[i] = userTicketList[userTicketList.length - 1];
                userTicketList.pop();
                break;
            }
        }
    }
    
    function withdraw() public onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }
    
    function getTotalTickets() public view returns (uint256) {
        return ticketCounter;
    }
}
