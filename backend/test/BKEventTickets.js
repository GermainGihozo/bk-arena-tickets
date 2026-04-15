import { expect } from "chai";
import hre from "hardhat";

describe("BKEventTickets", function () {
  const { ethers } = hre;
  let contract;
  let admin;
  let user1;
  let user2;

  beforeEach(async function () {
    [admin, user1, user2] = await ethers.getSigners();
    const BKEventTickets = await ethers.getContractFactory("BKEventTickets");
    contract = await BKEventTickets.deploy();
    await contract.waitForDeployment();
  });

  it("Should purchase a ticket", async function () {
    const eventName = "BK Arena Concert";
    const price = ethers.parseEther("0.1");

    await expect(
      contract.connect(user1).purchaseTicket(eventName, price, { value: price })
    )
      .to.emit(contract, "TicketPurchased")
      .withArgs(1, user1.address, eventName, price);

    const ticket = await contract.getTicket(1);
    expect(ticket.owner).to.equal(user1.address);
    expect(ticket.eventName).to.equal(eventName);
  });

  it("Should transfer a ticket", async function () {
    const price = ethers.parseEther("0.1");
    await contract.connect(user1).purchaseTicket("Event", price, { value: price });

    await expect(contract.connect(user1).transferTicket(1, user2.address))
      .to.emit(contract, "TicketTransferred")
      .withArgs(1, user1.address, user2.address);

    const ticket = await contract.getTicket(1);
    expect(ticket.owner).to.equal(user2.address);
  });

  it("Should validate a ticket", async function () {
    const price = ethers.parseEther("0.1");
    await contract.connect(user1).purchaseTicket("Event", price, { value: price });

    await contract.connect(admin).validateTicket(1);
    const ticket = await contract.getTicket(1);
    expect(ticket.isUsed).to.be.true;
  });
});
