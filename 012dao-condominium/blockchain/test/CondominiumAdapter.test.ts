import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { Bytecode } from "hardhat/internal/hardhat-network/stack-traces/model";

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


});
