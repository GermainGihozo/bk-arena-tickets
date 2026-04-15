import hre from "hardhat";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  try {
    const code = await hre.ethers.provider.getCode(contractAddress);
    
    if (code === "0x") {
      console.log("❌ Contract NOT deployed at:", contractAddress);
      console.log("\nPlease run: npx hardhat run scripts/deploy.js --network localhost");
    } else {
      console.log("✅ Contract IS deployed at:", contractAddress);
      
      // Try to interact with it
      const BKEventTickets = await hre.ethers.getContractFactory("BKEventTickets");
      const contract = BKEventTickets.attach(contractAddress);
      
      const totalTickets = await contract.getTotalTickets();
      console.log("📊 Total tickets sold:", totalTickets.toString());
      
      const admin = await contract.admin();
      console.log("👤 Admin address:", admin);
    }
  } catch (error) {
    console.error("❌ Error checking deployment:", error.message);
    console.log("\nMake sure Hardhat node is running: npx hardhat node");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
