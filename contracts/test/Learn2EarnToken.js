
const { expect } = require("chai");

describe("Learn2EarnToken", function () {
  it("Should deploy and have correct name/symbol", async function () {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Learn2EarnToken");
    const token = await Token.deploy();
    
    expect(await token.name()).to.equal("Learn2Earn");
    expect(await token.symbol()).to.equal("L2E");
  });
});