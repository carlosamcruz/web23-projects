// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ICondominium.sol";
//import "./CondominiumLib.sol";
import {CondominiumLib as Lib} from "./CondominiumLib.sol";

contract CondominiumAdapter {

    ICondominium private implementation;

    address public immutable owner;

    constructor(){
        owner = msg.sender;
    }

    modifier upgraded {
        require(address(implementation) != address(0), "You must upgrade first");
        _;
    }
    

    function getAddressImplementation() external view returns(address){
        return address(implementation);
    }

    function update(address newImplementation) external {
        require(msg.sender == owner, "You do not have permission");
        implementation = ICondominium(newImplementation);
    }

    function addResident (address resident, uint16 residenceId) external upgraded{
        return implementation.addResident(resident, residenceId);
    }
    
    function removeResident (address resident) external upgraded{
        return implementation.removeResident(resident);
    }
    
    function setCounselor (address resident, bool isEntering) external upgraded{
        return implementation.setCounselor(resident, isEntering);
    }
    
    /*
    //TODO: mudar
    function setManager(address newManager) external{
        return implementation.setManager(newManager);
    }

    */

    function addTopic(string memory title, string memory description, Lib.Category category, uint amount, address responsible) external upgraded{
        return implementation.addTopic(title, description, category, amount, responsible);
    }

    function editTopic(string memory titleToEdit, string memory description, uint amount, address responsible) external upgraded{
        return implementation.editTopic(titleToEdit, description, amount, responsible);
    }

    function removeTopic(string memory title) external upgraded{
        return implementation.removeTopic(title);
    }

    function openVoting(string memory title) external upgraded{
        return implementation.openVoting(title);
    }

    function vote(string memory title, Lib.Options option) external upgraded{
        return implementation.vote(title, option);
    }

    function closeVoting(string memory title) external upgraded{
        return implementation.closeVoting(title);
    }

    function payQuota(uint16 residenceID) external payable upgraded{
        return implementation.payQuota{value: msg.value}(residenceID);
    }

    //TODO: transfer

}