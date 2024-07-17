import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("JKAdapter Tests", function () {

  enum Options {NONE, ROCK, PAPER, SCISSORS}; // 0, 1, 2 , 3

  const DEFAULT_BID = ethers.parseEther("0.01");
  const DEFAULT_COMISSION = 10n;


  async function deployFixture() {

    const [owner, player1, player2] = await hre.ethers.getSigners();


    const JoKenPo = await hre.ethers.getContractFactory("JoKenPo");
    const joKenPo = await JoKenPo.deploy();


    const JKPAdapter = await hre.ethers.getContractFactory("JKPAdapter");
    const jKPAdapter = await JKPAdapter.deploy();

    return { joKenPo, jKPAdapter, owner, player1, player2 };
  }

  it("Should get implementation address", async function () {
    const { joKenPo, jKPAdapter, owner, player1, player2 } = await loadFixture(deployFixture);

    await jKPAdapter.upgrade(joKenPo);

    const address = await joKenPo.getAddress();

    const implementationAddress = await jKPAdapter.getImplementationAddress();
    
    expect(implementationAddress).to.equal(address);
  });


  it("Should get bid", async function () {
    const { joKenPo, jKPAdapter, owner, player1, player2 } = await loadFixture(deployFixture);

    await jKPAdapter.upgrade(joKenPo);

    const bid = await jKPAdapter.getBid();

    expect(bid).to.equal(DEFAULT_BID);
  });

  it("Should NOT get bid (upgrade)", async function () {
    const { joKenPo, jKPAdapter, owner, player1, player2 } = await loadFixture(deployFixture);

    await expect(jKPAdapter.getBid())
        .to.be.revertedWith("You must upgrade first");
  });


  it("Should get comission", async function () {
    const { joKenPo, jKPAdapter, owner, player1, player2 } = await loadFixture(deployFixture);

    await jKPAdapter.upgrade(joKenPo);

    const comission = await jKPAdapter.getComission();

    expect(comission).to.equal(DEFAULT_COMISSION);
  });

  it("Should NOT get comission (upgrade)", async function () {
    const { joKenPo, jKPAdapter, owner, player1, player2 } = await loadFixture(deployFixture);

    await expect(jKPAdapter.getComission())
        .to.be.revertedWith("You must upgrade first");
  });


  it("Should NOT upgrade (permission)", async function () {
    const { joKenPo, jKPAdapter, owner, player1, player2 } = await loadFixture(deployFixture);

    const instance = jKPAdapter.connect(player1);

    await expect(instance.upgrade(joKenPo))
        .to.be.revertedWith("You do not have permission");
  });

  it("Should NOT upgrade (address)", async function () {
    const { joKenPo, jKPAdapter, owner, player1, player2 } = await loadFixture(deployFixture);

    await expect(jKPAdapter.upgrade(ethers.ZeroAddress))
        .to.be.revertedWith("Empty address is not permited");
  });


  it("Should play alone by adapter", async function () {
    const { joKenPo, jKPAdapter, owner, player1, player2 } = await loadFixture(deployFixture);

    await jKPAdapter.upgrade(joKenPo);

    const instance = jKPAdapter.connect(player1);

    await instance.play(Options.PAPER, {value: DEFAULT_BID});

    const result = await instance.getResult()

    expect(result).to.equal("Player 1 chose his/her option. Waiting player 2");
  });
 
  
  it("Should play along by adapter", async function () {
    const { joKenPo, jKPAdapter, owner, player1, player2 } = await loadFixture(deployFixture);

    await jKPAdapter.upgrade(joKenPo);

    const instance = jKPAdapter.connect(player1);
    await instance.play(Options.PAPER, {value: DEFAULT_BID});

    const instance2 = jKPAdapter.connect(player2);
    await instance2.play(Options.SCISSORS, {value: DEFAULT_BID});

    const result = await instance.getResult()

    expect(result).to.equal("Scissors cuts paper, Player 2 won");
  });
  
});
