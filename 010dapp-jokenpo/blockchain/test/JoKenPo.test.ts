import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("JoKenPo", function () {

  enum Options {NONE, ROCK, PAPER, SCISSORS}; // 0, 1, 2 , 3

  const DEFAULT_BID = ethers.parseEther("0.01");


  async function deployFixture() {

    const [owner, player1, player2] = await hre.ethers.getSigners();

    const JoKenPo = await hre.ethers.getContractFactory("JoKenPo");
    const joKenPo = await JoKenPo.deploy();

    return { joKenPo, owner, player1, player2 };
  }

  it("Should get leaderboard", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const player1Instance = joKenPo.connect(player1);
    await player1Instance.play(Options.PAPER, {value: DEFAULT_BID});

    const player2Instance = joKenPo.connect(player2);
    await player2Instance.play(Options.ROCK, {value: DEFAULT_BID});

    const leaderboard = await joKenPo.getLeaderboard();

    expect(leaderboard.length).to.equal(1);
    expect(leaderboard[0].wallet).to.equal(player1);
    expect(leaderboard[0].wins).to.equal(1);
  });

  it("Should set bid", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const newBid = ethers.parseEther("0.02");

    await joKenPo.setBid(newBid);

    const updatedBid = await joKenPo.getBid();

    expect(updatedBid).to.equal(newBid);
  });

  it("Should NOT set bid (permission)", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const newBid = ethers.parseEther("0.02");

    const instance = joKenPo.connect(player1);

    await expect(instance.setBid(newBid))
      .to.be.revertedWith("You do not have permission");
  });

  it("Should NOT set bid (game in progress)", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const newBid = ethers.parseEther("0.02");

    const instance = joKenPo.connect(player1);
    await instance.play(Options.PAPER, {value: DEFAULT_BID});


    await expect(joKenPo.setBid(newBid))
      .to.be.revertedWith("You can not change the bid with a game in progress");
  });

  it("Should set comission", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const newComission = 20;

    await joKenPo.setComission(newComission);

    const updatedComission = await joKenPo.getComission();

    expect(updatedComission).to.equal(newComission);
  });

  it("Should NOT set comission (permission)", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const newComission = 20;

    const instance = joKenPo.connect(player1);

    await expect(instance.setComission(newComission))
      .to.be.revertedWith("You do not have permission");
  });


  it("Should NOT set comission (game in progress)", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const newComission = 20;

    const instance = joKenPo.connect(player1);
    await instance.play(Options.PAPER, {value: DEFAULT_BID});


    await expect(joKenPo.setComission(newComission))
      .to.be.revertedWith("You can not change the comission with a game in progress");
  });

  it("Should play alone", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const player1Instance = joKenPo.connect(player1);
    await player1Instance.play(Options.PAPER, {value: DEFAULT_BID});

    const result = await joKenPo.getResult();

    expect(result).to.equal("Player 1 chose his/her option. Waiting player 2");
    
  });

  it("Should play along", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const player1Instance = joKenPo.connect(player1);
    await player1Instance.play(Options.PAPER, {value: DEFAULT_BID});

    const player2Instance = joKenPo.connect(player2);
    await player2Instance.play(Options.ROCK, {value: DEFAULT_BID});

    const result = await joKenPo.getResult();

    expect(result).to.equal("Paper wraps rock, Player 1 won");

  });

  it("Should NOT play alone (owner)", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    await expect(joKenPo.play(Options.PAPER, {value: DEFAULT_BID}))
      .to.be.revertedWith("The owner cannot play");
    
  });

  it("Should NOT play alone (wrong option)", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const player1Instance = joKenPo.connect(player1);
    await expect(player1Instance.play(Options.NONE, {value: DEFAULT_BID}))
    .to.be.revertedWith("Invalid choice");
    
  });

  it("Should NOT play along (twice)", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    const player1Instance = joKenPo.connect(player1);
    await player1Instance.play(Options.PAPER, {value: DEFAULT_BID});

    await expect(player1Instance.play(Options.ROCK, {value: DEFAULT_BID}))
    .to.be.revertedWith("Wait the other player");

  });

  it("Should NOT play alone (wrong bid)", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(deployFixture);

    //const DEFAULT_BID = ethers.parseEther("0.01");
    const player1Instance = joKenPo.connect(player1);
    
    await expect(player1Instance.play(Options.PAPER, {value: DEFAULT_BID - 2n}))
      .to.be.revertedWith("Invalid Bid");
    
  });
  

});
