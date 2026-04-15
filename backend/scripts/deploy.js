import hre from "hardhat";

async function main() {
  console.log("Deploying BKEventTickets contract...");

  const BKEventTickets = await hre.ethers.getContractFactory("BKEventTickets");
  const contract = await BKEventTickets.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`BKEventTickets deployed to: ${address}`);
  console.log("Save this address for frontend integration!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
