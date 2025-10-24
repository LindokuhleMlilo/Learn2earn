// scripts/addMinter.js
const { ethers } = require("hardhat");

async function main() {
  const tokenAddress = "0x556B922efcA8Fd87A0545B4efB5f0B2129B136B5";
  const minterAddress = "YOUR_BACKEND_WALLET_ADDRESS"; // Replace with your backend wallet
  
  const Learn2EarnToken = await ethers.getContractFactory("Learn2EarnToken");
  const token = await Learn2EarnToken.attach(tokenAddress);
  
  console.log("Adding minter:", minterAddress);
  const tx = await token.addMinter(minterAddress);
  await tx.wait();
  
  console.log("Minter added successfully!");
  console.log("Transaction hash:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });