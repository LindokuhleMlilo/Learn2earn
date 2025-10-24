// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying Learn2EarnToken...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const Learn2EarnToken = await hre.ethers.getContractFactory("Learn2EarnToken");
  const token = await Learn2EarnToken.deploy();
  
  // For Hardhat v2.x, use deployed() instead of waitForDeployment()
  await token.deployed();

  console.log("Learn2EarnToken deployed to:", token.address);
  console.log("Transaction hash:", token.deployTransaction.hash);
  
  // Wait for a few confirmations
  console.log("Waiting for confirmations...");
  await token.deployTransaction.wait(2);
  console.log("Deployment confirmed!");

  // Verify contract on Basescan (optional)
  console.log("Verifying contract on Basescan...");
  try {
    await hre.run("verify:verify", {
      address: token.address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Verification failed (this is normal if already verified):", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
  });