import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { Bytecode } from "hardhat/internal/hardhat-network/stack-traces/model";

describe("Condominium", function () {

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
  
  async function deployCondominiumFixture() {
  
    const [manager, resident] = await hre.ethers.getSigners();

    const Condominium = await hre.ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract, manager, resident };
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

    expect(await contract.counselors(resident.address)).to.equal(true);

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


  it("Should add topic (manager)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1");

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });

  it("Should add topic (resident)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    const instance = contract.connect(resident);

    await contract.addResident(resident.address, 2102);


    await instance.addTopic("topic 1", "desciption 1");

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });


  it("Should NOT add topic (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    //resident not added
    const instance = contract.connect(resident);

    await expect(instance.addTopic("topic 1", "desciption 1"))
      .to.be.revertedWith("Only the manager or the residents can do this");
  });

  it("Should NOT add topic (repeated)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1");

    await expect(contract.addTopic("topic 1", "desciption 1"))
      .to.be.revertedWith("This topic already exists");
  });


  it("Should remove topic", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    await contract.addTopic("topic 1", "desciption 1");

    await contract.removeTopic("topic 1");

    expect(await contract.topicExists("topic 1")).to.equal(false); 
  });

  it("Should NOT remove topic (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    const instance = contract.connect(resident);

    await contract.addResident(resident.address, 2102);

    await contract.addTopic("topic 1", "desciption 1");

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

    await contract.addTopic("topic 1", "desciption 1");

    await contract.openVoting("topic 1");

    await expect(contract.removeTopic("topic 1"))
        .to.be.revertedWith("Only IDLE topic can be removed");
  });

  it("Should vote V1", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);

    await contract.addTopic("topic 1", "desciption 1");
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
  
    await contract.addTopic("topic 1", "desciption 1");
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
    
    await contract.addTopic("topic 1", "desciption 1");
    await contract.openVoting("topic 1");
      
    await instance.vote("topic 1", Options.YES);
    
    await expect(instance.vote("topic 1", Options.YES))
      .to.be.revertedWith("A residence should vote only once");
  });  


  it("Should NOT vote (status)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
      
    await contract.addTopic("topic 1", "desciption 1");
    //await contract.openVoting("topic 1");
        
    //await instance.vote("topic 1", Options.YES);
      
    await expect(instance.vote("topic 1", Options.YES))
      .to.be.revertedWith("Only VOTING topic can be voted");
  });  

  it("Should NOT vote (exist)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
      
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
      
    await contract.addTopic("topic 1", "desciption 1");
    await contract.openVoting("topic 1");
        
    //await instance.vote("topic 1", Options.YES);
      
    await expect(instance.vote("topic 1", Options.YES))
      .to.be.revertedWith("Only the manager or the residents can do this");
  });    

  it("Should NOT vote (option EMPTY)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
      
    await contract.addTopic("topic 1", "desciption 1");
    await contract.openVoting("topic 1");
        
    //await instance.vote("topic 1", Options.YES);
      
    await expect(instance.vote("topic 1", Options.EMPTY))
      .to.be.revertedWith("The option cannot be EMPTY");
  }); 

  it("Should close voting", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
      
    await contract.addTopic("topic 1", "desciption 1");
    await contract.openVoting("topic 1");
    await contract.vote("topic 1", Options.YES);    
    await instance.vote("topic 1", Options.YES);

    await contract.closeVoting("topic 1");

    const topic = await contract.getTopic("topic 1")

    expect(topic.status).to.equal(Status.APPROVED);
  }); 

  it("Should NOT close voting (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);
      
    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);
      
    await contract.addTopic("topic 1", "desciption 1");
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
      
    await contract.addTopic("topic 1", "desciption 1");
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
      
    await contract.addTopic("topic 1", "desciption 1");
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
      
    await contract.addTopic("topic 1", "desciption 1");
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

});
