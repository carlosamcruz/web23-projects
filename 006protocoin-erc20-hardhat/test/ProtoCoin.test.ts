import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("ProtoCoin Tests", function () {
  
  async function deployProtoCoinFixture() {

    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ProtoCoin = await hre.ethers.getContractFactory("ProtoCoin");
    const protoCoin = await ProtoCoin.deploy();

    return { protoCoin, owner, otherAccount };
  }

  it("Should test", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    expect(true).to.equal(true);
  });

});
