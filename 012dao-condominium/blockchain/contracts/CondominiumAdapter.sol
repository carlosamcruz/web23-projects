// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ICondominium.sol";
//import "./CondominiumLib.sol";
import {CondominiumLib as Lib} from "./CondominiumLib.sol";

contract CondominiumAdapter {

    ICondominium private implementation;
    address public immutable owner;

    //EVENTS
    event QuotaChange(uint amount);

    event ManagerChange(address manager);

    event TopicChaged(bytes32 indexed topicID, string title, Lib.Status indexed status);

    event Tranfer(address to, uint indexed amount, string topic);

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
        require(newImplementation != address(0), "Invalid Address");
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
        //return implementation.editTopic(titleToEdit, description, amount, responsible);
        Lib.TopicUpdate memory topic = implementation.editTopic(titleToEdit, description, amount, responsible);
        emit TopicChaged(topic.id, topic.title, topic.status);
    }

    function removeTopic(string memory title) external upgraded{
        //return implementation.removeTopic(title);
        Lib.TopicUpdate memory topic = implementation.removeTopic(title);
        emit TopicChaged(topic.id, topic.title, topic.status);
    }

    function openVoting(string memory title) external upgraded{
        //return implementation.openVoting(title);
        Lib.TopicUpdate memory topic = implementation.openVoting(title);
        emit TopicChaged(topic.id, topic.title, topic.status);
    }

    function vote(string memory title, Lib.Options option) external upgraded{
        return implementation.vote(title, option);
    }

    function closeVoting(string memory title) external upgraded{
        //return implementation.closeVoting(title);
        Lib.TopicUpdate memory topic = implementation.closeVoting(title);
        emit TopicChaged(topic.id, topic.title, topic.status);      

        if(topic.status == Lib.Status.APPROVED){
            if(topic.category == Lib.Category.CHANGE_MANAGER)
                emit ManagerChange(implementation.getManager());
            else if(topic.category == Lib.Category.CHANGE_QUOTA)
                emit QuotaChange(implementation.getQuota());                
        }
          
    }

    function payQuota(uint16 residenceID) external payable upgraded{
        return implementation.payQuota{value: msg.value}(residenceID);
    }

    function transfer(string memory topicTitle, uint amount) external upgraded{
        //return implementation.transfer(topicTitle, amount);

        Lib.TransferReceipt memory receipt = implementation.transfer(topicTitle, amount);

        emit Tranfer(receipt.to, receipt.amount, receipt.topic);
    }
    
    function getManager() external view upgraded returns(address){
        return implementation.getManager();
    }

    function getQuota() external view upgraded returns(uint){
        return implementation.getQuota();
    }

    function getResident(address resident) external view upgraded returns(Lib.Resident memory){
        return implementation.getResident(resident);
    }

    function getResidents(uint page, uint pageSize) external view upgraded returns(Lib.ResidentPage memory){
        return implementation.getResidents(page, pageSize);
    }

    function getTopic(string memory title) external view upgraded returns(Lib.Topic memory){
        return implementation.getTopic(title);
    }

    function getTopics(uint page, uint pageSize) external view upgraded returns(Lib.TopicPage memory){
        return implementation.getTopics(page, pageSize);
    }
    function getVotes(string memory topicTitle ) external view upgraded returns(Lib.Vote[] memory){
        return implementation.getVotes(topicTitle);
    }
}