import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { Bytecode } from "hardhat/internal/hardhat-network/stack-traces/model";
import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers"
import { CondominiumAdapter } from "../typechain-types";

describe("CondominiumAdapter", function () {

  enum Status{
    IDLE,
    VOLTING,
    APPROVED,
    DENIED
  }// 0, 1, 2 3

  enum Options{
    EMPTY,
    YES,
    NO,
    ABSTENTION
  }// 0, 1, 2 3

  enum Category{
    DECISION,
    SPENT,
    CHANGE_QUOTA,
    CHANGE_MANAGER
  }// 0, 1, 2 3   

  async function addResidents(adapter: CondominiumAdapter, count: number, accounts: SignerWithAddress[]){
    for(let i = 1; i <= count; i++){
      const residentId = 1000*Math.ceil(i/25) + 100*Math.ceil(i/5) + (i - (5*Math.floor((i-1)/5)));
      await adapter.addResident(accounts[i].address,  residentId);
      const instance = adapter.connect(accounts[i]);
      await instance.payQuota(residentId, {value: hre.ethers.parseEther("0.01")});
    }
  }

  async function addVotes(adapter: CondominiumAdapter, count: number, accounts: SignerWithAddress[]){
    for(let i = 1; i <= count; i++){
      const instance = adapter.connect(accounts[i]);
      await instance.vote("topic 1", Options.YES);
    }
  }

  async function deployAdapterFixture() {

    const accounts = await hre.ethers.getSigners();
  
    const manager = accounts[0];

    const CondominiumAdapter = await hre.ethers.getContractFactory("CondominiumAdapter");
    const adapter = await CondominiumAdapter.deploy();

    return { adapter, manager, accounts };
  }
  
  async function deployImplementationFixture() {
    const Condominium = await hre.ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract };
  }

  it("Should be upgrade", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.update(await contract.getAddress());

    const address = await adapter.getAddressImplementation();

    expect(await contract.getAddress()).to.equal(address);
  });

  it("Should NOT upgrade", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const instance = adapter.connect(accounts[1]);
    await expect(instance.update(await contract.getAddress())).to.revertedWith("You do not have permission");
  });

  it("Should add resident", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.update(await contract.getAddress());

    //await adapter.addResident(await accounts[1].getAddress(), 1301n)
    await adapter.addResident(accounts[1].address, 1301)

    expect(await contract.isResident(accounts[1].address)).to.equal(true);
  });

  it("Should NOT add resident (upgraded)", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    
    await expect(adapter.addResident(accounts[1].address, 1301))
      .to.be.revertedWith("You must upgrade first");
  });

  it("Should remove resident", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.update(await contract.getAddress());

    //await adapter.addResident(await accounts[1].getAddress(), 1301n)
    await adapter.addResident(accounts[1].address, 1301);

    await adapter.removeResident(accounts[1].address);

    expect(await contract.isResident(accounts[1].address)).to.equal(false);
  });

  it("Should NOT remove resident (upgraded)", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    
    await expect(adapter.removeResident(accounts[1].address))
      .to.be.revertedWith("You must upgrade first");
  });
  

  it("Should set Counselor", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.update(await contract.getAddress());

    //await adapter.addResident(await accounts[1].getAddress(), 1301n)
    await adapter.addResident(accounts[1].address, 1301);

    await adapter.setCounselor(accounts[1].address, true);

    expect(await contract.counselors(accounts[1].address)).to.equal(true);
  });

  it("Should NOT set counselor (upgraded)", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    
    await expect(adapter.setCounselor(accounts[1].address, true))
      .to.be.revertedWith("You must upgrade first");
  });

  it("Should add Topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.update(await contract.getAddress());

    await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });

  it("Should NOT add topic (upgraded)", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    
    await expect(adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address))
      .to.be.revertedWith("You must upgrade first");
  });

  it("Should edit Topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.update(await contract.getAddress());

    await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);
    await adapter.editTopic("topic 1", "description 2", 0, manager.address);

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });

  it("Should NOT edit topic (upgraded)", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    
    await expect(adapter.editTopic("topic 1", "description 2", 0, manager.address))
      .to.be.revertedWith("You must upgrade first");
  });

  it("Should remove Topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.update(await contract.getAddress());

    await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

    await adapter.removeTopic("topic 1");

    expect(await contract.topicExists("topic 1")).to.equal(false);
  });

  it("Should NOT remove topic (upgraded)", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    
    await expect(adapter.removeTopic("topic 1"))
      .to.be.revertedWith("You must upgrade first");
  });

  it("Should open Voting", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.update(await contract.getAddress());

    await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

    await adapter.openVoting("topic 1");

    const topic = await contract.getTopic("topic 1");

    expect(topic.status).to.equal(Status.VOLTING);
  });

  it("Should NOT open voting (upgraded)", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    
    await expect(adapter.openVoting("topic 1"))
      .to.be.revertedWith("You must upgrade first");
  });

  it("Should vote", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.update(await contract.getAddress());

    await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

    await adapter.openVoting("topic 1");

    await adapter.addResident(accounts[1].address, 1301);

    const instance = adapter.connect(accounts[1]);

    await adapter.payQuota(1301, {value: hre.ethers.parseEther("0.01")});

    await instance.vote("topic 1", Options.YES);

    expect(await contract.numberOfVotes("topic 1")).to.equal(1);
  });

  it("Should NOT vote (upgraded)", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    
    await expect(adapter.vote("topic 1", Options.YES))
      .to.be.revertedWith("You must upgrade first");
  });


  it("Should close voting", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.update(await contract.getAddress());

    await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

    await adapter.openVoting("topic 1");

    //await adapter.addResident(accounts[1].address, 1301);

    await addResidents(adapter, 5, accounts);

    //const instance = adapter.connect(accounts[1]);

    //await instance.vote("topic 1", Options.YES);
    await addVotes(adapter, 5, accounts);

    await adapter.closeVoting("topic 1");

    const topic = await contract.getTopic("topic 1");

    expect(topic.status).to.equal(Status.APPROVED);

  });

  it("Should NOT close vote (upgraded)", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    
    await expect(adapter.closeVoting("topic 1"))
      .to.be.revertedWith("You must upgrade first");
  });



});
