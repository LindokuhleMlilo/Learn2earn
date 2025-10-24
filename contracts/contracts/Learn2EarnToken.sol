// contracts/Learn2EarnToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19; // Using 0.8.19 as originally planned

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Learn2EarnToken is ERC20, ERC20Burnable, Ownable {
    mapping(address => bool) public minters;
    
    event RewardMinted(address indexed to, uint256 amount, string lessonId);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor() ERC20("Learn2Earn", "L2E") {}

    function mintReward(address to, uint256 amount, string memory lessonId) external onlyMinter {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be positive");
        
        _mint(to, amount);
        emit RewardMinted(to, amount, lessonId);
    }

    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    function isMinter(address account) external view returns (bool) {
        return minters[account];
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    modifier onlyMinter() {
        require(minters[msg.sender], "Caller is not a minter");
        _;
    }
}