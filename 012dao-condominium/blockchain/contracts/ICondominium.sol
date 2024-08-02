// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CondominiumLib as Lib} from "./CondominiumLib.sol";

interface ICondominium {

    function addResident (address resident, uint16 residenceId) external;
    
    function removeResident (address resident) external;
    
    function setCounselor (address resident, bool isEntering) external;
    
    //TODO: mudar
    function setManager(address newManager) external;

    //TODO: mudar
    function addTopic(string memory title, string memory description) external;

    //TODO: edit topic

    function removeTopic(string memory title) external;

    //TODO: set quota

    function openVoting(string memory title) external;

    function vote(string memory title, Lib.Options option) external;

    function closeVoting(string memory title) external;

    //TODO: pay quota

    //TODO: transfer
}