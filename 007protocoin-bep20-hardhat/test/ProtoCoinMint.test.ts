import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("ProtoCoinMint Tests", function () {
  
  async function deployProtoCoinFixture() {

    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ProtoCoinMint = await hre.ethers.getContractFactory("ProtoCoinMint");
    const protoCoin = await ProtoCoinMint.deploy();

    return { protoCoin, owner, otherAccount };
  }

  it("Should have correct name", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const name = await protoCoin.name();

    expect(name).to.equal("ProtoCoinMint");
  });

  it("Should have correct symbol", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const symbol = await protoCoin.symbol();

    expect(symbol).to.equal("PRCM");
  });

  it("Should have correct decimals", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const decimals = await protoCoin.decimals();

    expect(decimals).to.equal(18);
  });

  it("Should have correct totalSupply", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const totalSupply = await protoCoin.totalSupply();

    expect(totalSupply).to.equal(21000000n * 10n ** 18n);
  });

  it("Should get balance", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const balance = await protoCoin.balanceOf(owner.address);

    expect(balance).to.equal(21000000n * 10n ** 18n);
  });

  it("Should transfer", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const balanceOwnerBefore = await protoCoin.balanceOf(owner.address);
    const balanceOtherBefore = await protoCoin.balanceOf(otherAccount.address);

    await protoCoin.transfer(otherAccount, 1n);

    const balanceOwnerAfter = await protoCoin.balanceOf(owner.address);
    const balanceOtherAfter = await protoCoin.balanceOf(otherAccount.address);

    expect(balanceOwnerBefore).to.equal(21000000n * 10n ** 18n);
    expect(balanceOwnerAfter).to.equal(21000000n * 10n ** 18n - 1n);

    expect(balanceOtherBefore).to.equal(0n);
    expect(balanceOtherAfter).to.equal(1);
  });


  it("Should NOT transfer", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const instance = protoCoin.connect(otherAccount);
    await expect(instance.transfer(owner, 1))
      .to.be.revertedWithCustomError(protoCoin, "ERC20InsufficientBalance");
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

    expect(balanceOwnerBefore).to.equal(21000000n * 10n ** 18n);
    expect(balanceOwnerAfter).to.equal(21000000n * 10n ** 18n - 5n);

    expect(balanceOtherBefore).to.equal(0);
    expect(balanceOtherAfter).to.equal(5);

    expect(allowance).to.equal(5);
  });

  it("Should NOT transfer from (balance)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const instance = protoCoin.connect(otherAccount);

    await instance.approve(owner.address, 1n);

    await expect(protoCoin.transferFrom(otherAccount.address, owner.address, 1))
      .to.be.revertedWithCustomError(protoCoin,"ERC20InsufficientBalance");
  });

  it("Should NOT transfer from (allowance)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const instance = protoCoin.connect(otherAccount);
    await expect(instance.transferFrom(owner.address, otherAccount.address, 1))
      .to.be.revertedWithCustomError(protoCoin,"ERC20InsufficientAllowance");
  });

  it("Should mint once", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const mintAmount = 1000n;
    await protoCoin.setMintAmount(mintAmount);

    const balanceOtherBefore = await protoCoin.balanceOf(otherAccount.address);

    const instance = protoCoin.connect(otherAccount);
    await protoCoin.mint(otherAccount.address);
    const balanceOtherAfter = await protoCoin.balanceOf(otherAccount.address);

    expect(balanceOtherAfter).to.equal(balanceOtherBefore + mintAmount);

  });

  /*

  it("Should mint twice", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const mintAmount = 1000n;
    await protoCoin.setMintAmount(mintAmount);


    const balanceOwnerBefore = await protoCoin.balanceOf(owner.address);
    await protoCoin.mint(otherAccount.address);

    const balanceOtherBefore = await protoCoin.balanceOf(otherAccount.address);
    const instance = protoCoin.connect(otherAccount);
    await protoCoin.mint(otherAccount.address);
    const balanceOtherAfter = await protoCoin.balanceOf(otherAccount.address);
   
    expect(balanceOtherAfter).to.equal(balanceOtherBefore + mintAmount);

  });
  */

  it("Should mint twice (different moments)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const mintAmount = 1000n;
    await protoCoin.setMintAmount(mintAmount);

    const balanceOtherBefore = await protoCoin.balanceOf(otherAccount.address);
    const instance = protoCoin.connect(otherAccount);
    await protoCoin.mint(otherAccount.address);

    const mintDelay = 60 * 60 * 24 * 2; // 2 dia em segundos;

    await time.increase(mintDelay);


    await protoCoin.mint(otherAccount.address);


    const balanceOtherAfter = await protoCoin.balanceOf(otherAccount.address);
   
    expect(balanceOtherAfter).to.equal(balanceOtherBefore + 2n * mintAmount);

  });

  it("Should NOT set mint amount", async () => {
        const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const mintAmount = 1000n;
    const instance = protoCoin.connect(otherAccount);

    await expect(instance.setMintAmount(mintAmount))
      .to.be.revertedWith("You do not have permission.");
  })

  it("Should NOT set mint amount", async () => {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const mintAmount = 1000n;
    const instance = protoCoin.connect(otherAccount);

    await expect(instance.setMintAmount(mintAmount))
      .to.be.revertedWith("You do not have permission.");
  })

  it("Should NOT set mint delay", async () => {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    const mintDelay = 1000n;
    const instance = protoCoin.connect(otherAccount);

    await expect(instance.setMintDelay(mintDelay))
      .to.be.revertedWith("You do not have permission.");
  })  

  it("Should NOT mint", async () => {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    await expect(protoCoin.mint(otherAccount.address))
      .to.be.revertedWith("Mint is not enabled.");
  })

  it("Should NOT mint twice", async () => {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    await protoCoin.setMintAmount(1000n);

    await protoCoin.mint(otherAccount.address);

    await expect(protoCoin.mint(otherAccount.address))
      .to.be.revertedWith("You cannot mint twice in a day.");
  })

  it("Should NOT mint (Owner)", async () => {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployProtoCoinFixture);

    await protoCoin.setMintAmount(1000n);

    await expect(protoCoin.mint(owner.address))
      .to.be.revertedWith("Do not mint with owner address.");
  })



});
