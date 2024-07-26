import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Condominium", function () {
  
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

  it("Should be resident", async function () {
    const { contract, manager, resident } = await loadFixture(deployCondominiumFixture);

    expect(await contract.isResident(resident.address)).to.equal(true);
  });

});
