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

    function getAddressImplementation() external view returns(address){
        return address(implementation);
    }

    function update(address newImplementation) external {
        require(msg.sender == owner, "You do not have permission");
        implementation = ICondominium(newImplementation);
    }

    function addResident (address resident, uint16 residenceId) external{
        return implementation.addResident(resident, residenceId);
    }
    
    function removeResident (address resident) external{
        return implementation.removeResident(resident);
    }
    
    function setCounselor (address resident, bool isEntering) external{
        return implementation.setCounselor(resident, isEntering);
    }
    
    /*
    //TODO: mudar
    function setManager(address newManager) external{
        return implementation.setManager(newManager);
    }

    */

    function addTopic(string memory title, string memory description, Lib.Category category, uint amount, address responsible) external{
        return implementation.addTopic(title, description, category, amount, responsible);
    }

    //TODO: edit topic

    function removeTopic(string memory title) external{
        return implementation.removeTopic(title);
    }

    //TODO: set quota

    function openVoting(string memory title) external{
        return implementation.openVoting(title);
    }

    function vote(string memory title, Lib.Options option) external{
        return implementation.vote(title, option);
    }

    //TODO: mudar
    function closeVoting(string memory title) external{
        return implementation.closeVoting(title);
    }

    //TODO: pay quota

    //TODO: transfer

}