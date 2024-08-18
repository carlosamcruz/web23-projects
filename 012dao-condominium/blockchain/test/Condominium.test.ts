import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { Bytecode } from "hardhat/internal/hardhat-network/stack-traces/model";
import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers";
import { Condominium } from "../typechain-types";

describe("Condominium", function () {

  enum Status{
    IDLE,
    VOLTING,
    APPROVED,
    DENIED,
    SPENT
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

  async function addResidents(contract: Condominium, count: number, accounts: SignerWithAddress[]){
    for(let i = 1; i <= count; i++){
      const residentId = 1000*Math.ceil(i/25) + 100*Math.ceil(i/5) + (i - (5*Math.floor((i-1)/5)));
      await contract.addResident(accounts[i-1].address,  residentId);
      const instance = contract.connect(accounts[i-1]);
      await instance.payQuota(residentId, {value: hre.ethers.parseEther("0.01")});
    }
  }

  async function addVotes(contract: Condominium, count: number, accounts: SignerWithAddress[], option: Options){
    for(let i = 1; i <= count; i++){
      const instance = contract.connect(accounts[i-1]);
      await instance.vote("topic 1", option);
    }
  }
  
  async function deployCondominiumFixture() {
  
    //const [manager, resident] = await hre.ethers.getSigners();

    const accounts = await hre.ethers.getSigners();

    const manager = accounts[0];
    const resident = accounts[1];

    const Condominium = await hre.ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract, manager, resident, accounts };
  }

  it("Should be residence", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    expect(await contract.residenceExists(2102)).to.equal(true);
  });

  it("Should add resident", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addResident(resident.address, 2102);

    expect(await contract.isResident(resident.address)).to.equal(true);
  });

  it("Should NOT add resident (address = 0)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await expect(contract.addResident("0x0000000000000000000000000000000000000000", 2102))
      .to.revertedWith("Invalid address");
  });

  it("Should NOT add resident (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    const instance = contract.connect(resident);

    await expect(instance.addResident(resident.address, 2102))
      .to.be.revertedWith("Only the manager or the council can do this");
  });

  it("Should NOT add resident (residence does not exist)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await expect(contract.addResident(resident.address, 8102))
      .to.be.revertedWith("This residence does not exist");
  });

  it("Should remove resident (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addResident(resident.address, 2102);

    expect(await contract.isResident(resident.address)).to.equal(true);

    await contract.removeResident(resident.address);

    expect(await contract.isResident(resident.address)).to.equal(false);

  });

  it("Should NOT remove resident (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addResident(resident.address, 2102);

    expect(await contract.isResident(resident.address)).to.equal(true);

    const instance = contract.connect(resident);


    await expect(instance.removeResident(resident.address))
      .to.be.revertedWith("Only the manager can do this");

  });


  //it("Should NOT remove resident (counselor)", async function () {
  it("Should remove resident (counselor)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addResident(resident.address, 2102);

    await contract.setCounselor(resident.address, true);

    expect(await contract.isResident(resident.address)).to.equal(true);

    await contract.removeResident(resident.address);

    expect(await contract.isResident(resident.address)).to.equal(false);
  });

  it("Should set counselor", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addResident(resident.address, 2102);

    await contract.setCounselor(resident.address, true);

    const instance = contract.connect(resident);

    await instance.addResident(manager.address, 2103);

    expect(await contract.counselors(resident.address)).to.equal(true);

  });

  it("Should NOT add resident (address = 0)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await expect(contract.setCounselor("0x0000000000000000000000000000000000000000", true))
      .to.revertedWith("Invalid address");
  });

  it("Should delete counselor", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addResident(resident.address, 2102);

    await contract.setCounselor(resident.address, true);
    await contract.setCounselor(resident.address, false);

    expect(await contract.counselors(resident.address)).to.equal(false);

  });


  it("Should NOT set counselor (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addResident(resident.address, 2102);

    const instance = contract.connect(resident);

    await expect(instance.setCounselor(resident.address, true))
      .to.be.revertedWith("Only the manager can do this");

  });

  it("Should NOT set counselor (not resident)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    //await contract.addResident(resident.address, 2102);

    //const instance = contract.connect(resident);

    await expect(contract.setCounselor(resident.address, true))
      .to.be.revertedWith("The counselor must be a resident");

  });

  

  /*
  it("Should set manager", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    //await contract.addResident(resident.address, 2102);

    //await contract.setCounselor(resident.address, true);
    await contract.setManager(resident.address);

    expect(await contract.manager()).to.equal(resident.address);

  });

  it("Should NOT set manager (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    const instance = contract.connect(resident);

    await expect(instance.setManager(resident.address))
      .to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT set manager (address 0)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await expect(contract.setManager("0x0000000000000000000000000000000000000000"))
      .to.be.revertedWith("Address must be valid");
  });

  */

  it("Should change manager", async function () {
    const { contract, manager, resident, accounts } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    //await contract.addResident(resident.address, 2102);

    await addResidents(contract, 15, accounts);
      
    await contract.addTopic("topic 1", "desciption 1", Category.CHANGE_MANAGER, 0, accounts[10].address);
    await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);
    await addVotes(contract, 15, accounts, Options.YES);


    await contract.closeVoting("topic 1");

    //const topic = await contract.getTopic("topic 1")

    //expect(topic.status).to.equal(Status.APPROVED);
    expect(await contract.manager()).to.equal(accounts[10].address);

  });

  it("Should change quota", async function () {
    const { contract, manager, resident, accounts } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    //await contract.addResident(resident.address, 2102);

    await addResidents(contract, 20, accounts);
    
    const value = hre.ethers.parseEther("0.02")
    await contract.addTopic("topic 1", "desciption 1", Category.CHANGE_QUOTA, value, manager.address);
    await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);
    await addVotes(contract, 20, accounts, Options.YES);


    await contract.closeVoting("topic 1");

    //const topic = await contract.getTopic("topic 1")

    //expect(topic.status).to.equal(Status.APPROVED);
    expect(await contract.monthlyQuota()).to.equal(value);

  });

  it("Should spend", async function () {
    const { contract, manager, resident, accounts } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    //await contract.addResident(resident.address, 2102);

    await addResidents(contract, 10, accounts);
    
    const value = hre.ethers.parseEther("0.02")
    await contract.addTopic("topic 1", "desciption 1", Category.SPENT, value, manager.address);
    await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);
    await addVotes(contract, 10, accounts, Options.YES);


    await contract.closeVoting("topic 1");

    const topic = await contract.getTopic("topic 1")

    expect(topic.status).to.equal(Status.APPROVED);
    //expect(await contract.monthlyQuota()).to.equal(value);

  });

  it("Should NOT spend", async function () {
    const { contract, manager, resident, accounts } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    //await contract.addResident(resident.address, 2102);

    await addResidents(contract, 10, accounts);
    
    const value = hre.ethers.parseEther("0.02")
    await contract.addTopic("topic 1", "desciption 1", Category.SPENT, value, manager.address);
    await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);
    await addVotes(contract, 10, accounts, Options.NO);


    await contract.closeVoting("topic 1");

    const topic = await contract.getTopic("topic 1")

    expect(topic.status).to.equal(Status.DENIED);
    //expect(await contract.monthlyQuota()).to.equal(value);

  });

  it("Should NOT spend (abstention)", async function () {
    const { contract, manager, resident, accounts } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    //await contract.addResident(resident.address, 2102);

    await addResidents(contract, 10, accounts);
    
    const value = hre.ethers.parseEther("0.02")
    await contract.addTopic("topic 1", "desciption 1", Category.SPENT, value, manager.address);
    await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);
    await addVotes(contract, 10, accounts, Options.ABSTENTION);


    await contract.closeVoting("topic 1");

    const topic = await contract.getTopic("topic 1")

    expect(topic.status).to.equal(Status.DENIED);
    //expect(await contract.monthlyQuota()).to.equal(value);

  });


  it("Should add topic (manager)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });

  it("Should NOT add topic (amount)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await expect(contract.addTopic("topic 1", "desciption 1", Category.DECISION, 10, manager.address))
      .to.be.revertedWith("Wrong category");
  });

  it("Should add topic (resident)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    const instance = contract.connect(resident);

    await contract.addResident(resident.address, 2102);
    await contract.payQuota(2102, {value: hre.ethers.parseEther("0.01")});

    await instance.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });


  it("Should NOT add topic (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    //resident not added
    const instance = contract.connect(resident);

    await expect(instance.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address))
      .to.be.revertedWith("Only the manager or the residents can do this");
  });

  it("Should NOT add topic (repeated)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);

    await expect(contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address))
      .to.be.revertedWith("This topic already exists");
  });

  it("Should edit topic (manager)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);

    await contract.editTopic("topic 1", "desciption 2", 0, manager.address);

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });

  it("Should NOT edit topic (address)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);

    const instance = contract.connect(resident);

    await expect(instance.editTopic("topic 1", "desciption 2", 0, manager.address))
      .to.be.rejectedWith("Only the manager can do this");
  });

  it("Should NOT edit topic (exists)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1", Category.SPENT, 0, manager.address);
    await contract.addTopic("topic 3", "desciption 1", Category.CHANGE_QUOTA, 0, manager.address);
    await contract.editTopic("topic 1", "", 0, manager.address)
    await contract.editTopic("topic 1", "", 10, manager.address)
    await contract.editTopic("topic 3", "", 10, resident.address)

    await expect(contract.editTopic("topic 2", "desciption 2", 0, manager.address))
      .to.be.rejectedWith("Topic does not exist");
  });

  it("Should NOT edit topic (value)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    
    await expect(contract.editTopic("topic 1", "desciption 2", 10, manager.address))
      .to.be.rejectedWith("Topic cannot change value");
  });

  it("Should NOT edit topic (status)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");

    await expect(contract.editTopic("topic 1", "desciption 2", 0, manager.address))
      .to.be.rejectedWith("Only IDLE topics can be edited");
  });



  it("Should remove topic", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);

    await contract.removeTopic("topic 1");

    expect(await contract.topicExists("topic 1")).to.equal(false); 
  });

  it("Should NOT remove topic (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    const instance = contract.connect(resident);

    await contract.addResident(resident.address, 2102);

    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);

    await expect(instance.removeTopic("topic 1"))
      .to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT remove topic (does not exist)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    //await contract.addTopic("topic 1", "desciption 1");

    await expect(contract.removeTopic("topic 1"))
      .to.be.revertedWith("Topic does not exist");
  });

  it("Should NOT remove topic (status)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);

    await contract.openVoting("topic 1");

    await expect(contract.removeTopic("topic 1"))
        .to.be.revertedWith("Only IDLE topic can be removed");
  });

  it("Should vote V1", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
    await contract.payQuota(2102, {value: hre.ethers.parseEther("0.01")});    

    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");

    //const votings = await contract.votings(hre.ethers.keccak256(hre.ethers.getBytes("")));

    //const id = hre.ethers.keccak256(hre.ethers.getBytes("topic 1"));

    //const votings = await contract.votings(hre.ethers.getBytes(id));
      

    await instance.vote("topic 1", Options.YES);

    await expect(instance.vote("topic 1", Options.YES))
        .to.be.revertedWith("A residence should vote only once");
  });

  it("Should vote V2", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
  
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
    await contract.payQuota(2102, {value: hre.ethers.parseEther("0.01")});    
  
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");
  
    const nvotes =   await contract.numberOfVotes("topic 1");
  
    await instance.vote("topic 1", Options.YES);
  
    expect(await instance.numberOfVotes("topic 1"))
      .to.equal(nvotes + 1n);
  });
  
  
  it("Should NOT vote (duplicated)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
    
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
    await contract.payQuota(2102, {value: hre.ethers.parseEther("0.01")});    
    
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");
      
    await instance.vote("topic 1", Options.YES);
    
    await expect(instance.vote("topic 1", Options.YES))
      .to.be.revertedWith("A residence should vote only once");
  });  

  it("Should NOT vote (defaulter)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
    
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
    await contract.addResident(resident.address, 2101);
    //await contract.payQuota(2102, {value: hre.ethers.parseEther("0.01")});    
    
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");
         
    await expect(instance.vote("topic 1", Options.YES))
      .to.be.revertedWith("The resident must be defaulter");
  });  


  it("Should NOT vote (status)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
    await contract.payQuota(2102, {value: hre.ethers.parseEther("0.01")});    
      
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    //await contract.openVoting("topic 1");
        
    //await instance.vote("topic 1", Options.YES);
      
    await expect(instance.vote("topic 1", Options.YES))
      .to.be.revertedWith("Only VOTING topic can be voted");
  });  

  it("Should NOT vote (exist)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
    await contract.payQuota(2102, {value: hre.ethers.parseEther("0.01")});    
      
    //await contract.addTopic("topic 1", "desciption 1");
    //await contract.openVoting("topic 1");
        
    //await instance.vote("topic 1", Options.YES);
      
    await expect(instance.vote("topic 1", Options.YES))
      .to.be.revertedWith("Topic does not exist");
  });  

  it("Should NOT vote (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    //await contract.addResident(resident.address, 2102);
      
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");
        
    //await instance.vote("topic 1", Options.YES);
      
    await expect(instance.vote("topic 1", Options.YES))
      .to.be.revertedWith("Only the manager or the residents can do this");
  });    

  it("Should NOT vote (option EMPTY)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
    await contract.payQuota(2102, {value: hre.ethers.parseEther("0.01")});    
      
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");
        
    //await instance.vote("topic 1", Options.YES);
      
    await expect(instance.vote("topic 1", Options.EMPTY))
      .to.be.revertedWith("The option cannot be EMPTY");
  }); 

  it("Should close voting", async function () {
    const { contract, manager, resident, accounts } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    //await contract.addResident(resident.address, 2102);

    await addResidents(contract, 5, accounts);
      
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);
    await addVotes(contract, 5, accounts, Options.YES);


    await contract.closeVoting("topic 1");

    const topic = await contract.getTopic("topic 1")

    expect(topic.status).to.equal(Status.APPROVED);
  }); 

  it("Should NOT close voting (minimum)", async function () {
    const { contract, manager, resident, accounts } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    //await contract.addResident(resident.address, 2102);

    await addResidents(contract, 5, accounts);
      
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);
    await addVotes(contract, 4, accounts, Options.YES);


    await expect(contract.closeVoting("topic 1"))
      .to.be.revertedWith("You cannot finish a topic without the minimum number of votes");
  }); 

  it("Should NOT close voting (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
    await contract.payQuota(2102, {value: hre.ethers.parseEther("0.01")});    
      
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");
    await contract.vote("topic 1", Options.YES);    
    await instance.vote("topic 1", Options.YES);

    await expect(instance.closeVoting("topic 1"))
      .to.be.revertedWith("Only the manager can do this");
  }); 

  it("Should NOT close voting (exists)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
      
    //await contract.addTopic("topic 1", "desciption 1");
    //await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);

    await expect(contract.closeVoting("topic 1"))
      .to.be.revertedWith("Topic does not exist");
  }); 

  it("Should NOT close voting (status)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
      
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    //await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);

    await expect(contract.closeVoting("topic 1"))
      .to.be.revertedWith("Only VOTING topic can be closed");
  }); 


  it("Should NOT open voting (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
      
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    //await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);

    await expect(instance.openVoting("topic 1"))
      .to.be.revertedWith("Only the manager can do this");
  }); 

  it("Should NOT open voting (status)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
      
    await contract.addTopic("topic 1", "desciption 1", Category.DECISION, 0, manager.address);
    await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);

    await expect(contract.openVoting("topic 1"))
      .to.be.revertedWith("Only IDLE topic can be open for voting");
  }); 


  it("Should NOT open voting (exists)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
      
    //await contract.addTopic("topic 1", "desciption 1");
    //await contract.openVoting("topic 1");
    //await contract.vote("topic 1", Options.YES);    
    //await instance.vote("topic 1", Options.YES);

    await expect(contract.openVoting("topic 1"))
      .to.be.revertedWith("Topic does not exist");
  }); 

  it("Should NOT pay quota (residence)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    //await contract.addResident(resident.address, 2102);
    
    await expect(instance.payQuota(9999, {value: hre.ethers.parseEther("0.01")}))
      .to.be.revertedWith("The residence does not exist");
  }); 

  it("Should NOT pay quota (value)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
    
    await expect(instance.payQuota(2102, {value: hre.ethers.parseEther("0.001")}))
      .to.be.revertedWith("Wrong value");
  }); 

  it("Should NOT pay quota (double payment)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
    await instance.payQuota(2102, {value: hre.ethers.parseEther("0.01")});
    
    await expect(instance.payQuota(2102, {value: hre.ethers.parseEther("0.01")}))
      .to.be.revertedWith("You cannot pay twice a month");
  }); 


  it("Should NOT tranfer (manager)", async function () {
    const { contract, manager, resident, accounts} = await loadFixture(deployCondominiumFixture);

    //Valor deve ser em wei
    await contract.addTopic("topic 1", "description 1", Category.SPENT, 100, accounts[19].address);

    await contract.openVoting("topic 1");
    await addResidents(contract, 10, accounts);

    await addVotes(contract, 10, accounts, Options.YES);

    await contract.closeVoting("topic 1");

    const instance = contract.connect(resident);

    await expect(instance.transfer("topic 1", 50))
      .to.be.rejectedWith("Only the manager can do this");

  });

  it("Should NOT tranfer (balance)", async function () {
    const { contract, manager, resident, accounts} = await loadFixture(deployCondominiumFixture);

    await expect(contract.transfer("topic 1", 50))
      .to.be.rejectedWith("Insufficient funds");

  });

  it("Should NOT tranfer (topic)", async function () {
    const { contract, manager, resident, accounts} = await loadFixture(deployCondominiumFixture);

    await expect(contract.transfer("topic 1", 0))
      .to.be.rejectedWith("Topic does not exist");

  });

  it("Should NOT tranfer (status)", async function () {
    const { contract, manager, resident, accounts} = await loadFixture(deployCondominiumFixture);

    //Valor deve ser em wei
    await contract.addTopic("topic 1", "description 1", Category.SPENT, 100, accounts[19].address);

    await contract.openVoting("topic 1");
    await addResidents(contract, 10, accounts);

    await addVotes(contract, 10, accounts, Options.YES);

    //await contract.closeVoting("topic 1");

    await expect(contract.transfer("topic 1", 50))
      .to.be.rejectedWith("Only APPROVED STPENT topics allowed");

  });

  it("Should NOT tranfer (amount)", async function () {
    const { contract, manager, resident, accounts} = await loadFixture(deployCondominiumFixture);

    //Valor deve ser em wei
    await contract.addTopic("topic 1", "description 1", Category.SPENT, 100, accounts[19].address);

    await contract.openVoting("topic 1");
    await addResidents(contract, 10, accounts);

    await addVotes(contract, 10, accounts, Options.YES);

    await contract.closeVoting("topic 1");

    await expect(contract.transfer("topic 1", 500))
      .to.be.rejectedWith("Amount must be less or equal the approved amount");

  });

});
