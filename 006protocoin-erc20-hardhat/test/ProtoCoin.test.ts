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

  it("Should have correct name", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const name = await protoCoin.name();

    expect(name).to.equal("ProtoCoin");
  });

  it("Should have correct symbol", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const symbol = await protoCoin.symbol();

    expect(symbol).to.equal("PRC");
  });

  it("Should have correct decimals", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const decimals = await protoCoin.decimals();

    expect(decimals).to.equal(18);
  });

  it("Should have correct totalSupply", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const totalSupply = await protoCoin.totalSupply();

    expect(totalSupply).to.equal(21000n * 10n ** 18n);
  });

  it("Should get balance", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const balance = await protoCoin.balanceOf(owner.address);

    expect(balance).to.equal(21000n * 10n ** 18n);
  });

  it("Should transfer", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const balanceOwnerBefore = await protoCoin.balanceOf(owner.address);
    const balanceOtherBefore = await protoCoin.balanceOf(otherAccount.address);

    await protoCoin.transfer(otherAccount, 1n);

    const balanceOwnerAfter = await protoCoin.balanceOf(owner.address);
    const balanceOtherAfter = await protoCoin.balanceOf(otherAccount.address);

    expect(balanceOwnerBefore).to.equal(21000n * 10n ** 18n);
    expect(balanceOwnerAfter).to.equal(21000n * 10n ** 18n - 1n);

    expect(balanceOtherBefore).to.equal(0n);
    expect(balanceOtherAfter).to.equal(1);
  });


  it("Should NOT transfer", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const instance = protoCoin.connect(otherAccount);
    await expect(instance.transfer(owner, 1))
      .to.be.revertedWith("Insuficient balance.");
  });

  it("Should approve", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    await protoCoin.approve(otherAccount.address, 10);

    const value = await protoCoin.allowance(owner.address, otherAccount.address); 

    expect(value).to.equal(10);
  });


  it("Should transfer from", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const balanceOwnerBefore = await protoCoin.balanceOf(owner.address);
    const balanceOtherBefore = await protoCoin.balanceOf(otherAccount.address);

    await protoCoin.approve(otherAccount.address, 10);

    const instance = protoCoin.connect(otherAccount);

    await instance.transferFrom(owner.address, otherAccount.address, 5);

    const balanceOwnerAfter = await protoCoin.balanceOf(owner.address);
    const balanceOtherAfter = await protoCoin.balanceOf(otherAccount.address);

    const allowance = await protoCoin.allowance(owner.address, otherAccount.address); 

    expect(balanceOwnerBefore).to.equal(21000n * 10n ** 18n);
    expect(balanceOwnerAfter).to.equal(21000n * 10n ** 18n - 5n);

    expect(balanceOtherBefore).to.equal(0);
    expect(balanceOtherAfter).to.equal(5);

    expect(allowance).to.equal(5);
  });

  it("Should NOT transfer from (balance)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const instance = protoCoin.connect(otherAccount);
    await expect(instance.transferFrom(otherAccount.address, otherAccount.address, 1))
      .to.be.revertedWith("Insuficient Balance.");
  });

  it("Should NOT transfer from (allowance)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const instance = protoCoin.connect(otherAccount);
    await expect(instance.transferFrom(owner.address, otherAccount.address, 1))
      .to.be.revertedWith("Insuficient allowance.");
  });


});
