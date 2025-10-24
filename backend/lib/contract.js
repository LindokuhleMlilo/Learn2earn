// lib/contract.js
import { ethers } from 'ethers';

// Updated ABI for the Learn2EarnToken contract
const LEARN2EARN_TOKEN_ABI = [
  "function mintReward(address to, uint256 amount, string memory lessonId) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function addMinter(address minter) external",
  "function removeMinter(address minter) external",
  "function isMinter(address account) external view returns (bool)",
  "function owner() external view returns (address)",
  "event RewardMinted(address indexed to, uint256 amount, string lessonId)",
  "event MinterAdded(address indexed minter)",
  "event MinterRemoved(address indexed minter)"
];

const CONTRACT_ADDRESS = process.env.REWARD_TOKEN_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.BASE_RPC_URL;

let provider;
let wallet;
let contract;

export function initializeContract() {
  if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
    throw new Error('Missing contract configuration');
  }

  provider = new ethers.JsonRpcProvider(RPC_URL);
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, LEARN2EARN_TOKEN_ABI, wallet);
}

export async function mintTokens(toAddress, amount, lessonId) {
  if (!contract) initializeContract();
  
  try {
    // Check if our wallet is authorized to mint
    const isAuthorizedMinter = await contract.isMinter(wallet.address);
    if (!isAuthorizedMinter) {
      throw new Error('Backend wallet is not authorized to mint tokens');
    }

    const tx = await contract.mintReward(toAddress, amount, lessonId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Minting error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function getBalance(address) {
  if (!contract) initializeContract();
  
  try {
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, 18); // Assuming 18 decimals
  } catch (error) {
    console.error('Balance check error:', error);
    return '0';
  }
}

export async function addMinter(minterAddress) {
  if (!contract) initializeContract();
  
  try {
    const tx = await contract.addMinter(minterAddress);
    const receipt = await tx.wait();
    return {
      success: true,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error('Add minter error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function isMinter(address) {
  if (!contract) initializeContract();
  
  try {
    return await contract.isMinter(address);
  } catch (error) {
    console.error('Minter check error:', error);
    return false;
  }
}