// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./ICondominium.sol";
//import "./CondominiumLib.sol";
import {CondominiumLib as Lib} from "./CondominiumLib.sol";

contract Condominium is ICondominium {
    address public manager;//Ownable
    uint256 public monthlyQuota = 0.01 ether;


    mapping (uint16 => bool) public residences; //unidades => true
    mapping (address => uint16) public residents; //wallet => unidades (1101) (2505)
    mapping (address => bool) public counselors; //conselheiro => true

    mapping (uint16 => uint) public payments; //unidade => ultimo pagamento (timestamp em segundos)

    mapping(bytes32 => Lib.Topic) public topics;
    mapping(bytes32 => Lib.Vote[]) public votings;

    constructor(){
        manager = msg.sender;

        //condiminio de 2 blocos, 5 andares por bloco, e 5 unidade por andar;

        //Laço para os blocos do condominio
        /*
        for(uint8 i = 1; i <=2; i ++){
            //Laço para os andarede do condominio
            for(uint8 j = 1; j <=5; j ++){
                //Laço para as unidades de cada andar
                for(uint8 k = 1; k <=5; k ++){

                    //Deu problema para o apartamento 1301
                    unchecked{//Usar se eu garanto que a operação não vai dar estouro no uint16
                        residences[1000*i + 100*j + k] = true;
                    }
                }
            }
        }
        */
        for(uint16 i = 1; i <=2; i ++){
            //Laço para os andarede do condominio
            for(uint16 j = 1; j <=5; j ++){
                //Laço para as unidades de cada andar
                for(uint16 k = 1; k <=5; k ++){
                    residences[1000*i + 100*j + k] = true;
                }
            }
        }
    }

    modifier onlyManager {
        //require(msg.sender == manager, "Only the manager can do this");
        require(tx.origin == manager, "Only the manager can do this");
        _;
    }

    modifier onlyCouncil {
        //require(msg.sender == manager || counselors[msg.sender], "Only the manager or the council can do this");
        require(tx.origin == manager || counselors[tx.origin], "Only the manager or the council can do this");
        _;
    }

    modifier onlyResidents () {
        require(tx.origin == manager || isResident(tx.origin), "Only the manager or the residents can do this");
        require(tx.origin == manager || block.timestamp < payments[residents[tx.origin]] + (30 * 24 * 60 * 60), "The resident must be defaulter");
        _;
    }

    modifier validAddress (address add) {
        require(add != address(0), "Invalid address");
        _;
    }    

    function residenceExists(uint16 residenceId) public view returns(bool){
        return residences[residenceId];
    }

    function isResident(address resident) public view returns (bool) {
        return residents[resident] > 0;
    }

    function addResident (address resident, uint16 residenceId) external onlyCouncil validAddress(resident){
        require(residenceExists(residenceId), "This residence does not exist");
        residents[resident] = residenceId;
    }

    function removeResident (address resident) external onlyManager {
        if (counselors[resident]) delete counselors[resident];
        //require(!counselors[resident], "A counselor cannot be removed");
        delete residents[resident];
    }

    function setCounselor (address resident, bool isEntering) external onlyManager validAddress(resident){
        if(isEntering)
        {
            require(isResident(resident), "The counselor must be a resident");
            counselors[resident] = true;
        }
        else 
            //counselors[resident] = false;
            delete counselors[resident];

    }

    /*
    function setManager(address newManager) external onlyManager{
        require(newManager != address(0), "Address must be valid");
        manager = newManager;
    }
    */

    function getTopic(string memory title) public view returns (Lib.Topic memory){
        bytes32 topicId = keccak256(bytes(title));
        return topics[topicId];
    }

    function topicExists(string memory title) public view returns(bool){
        return getTopic(title).createDate > 0;
    }

    function addTopic(string memory title, string memory description, Lib.Category category, uint amount, address responsible) 
    external onlyResidents {
        require(!topicExists(title), "This topic already exists");
        if(amount > 0)
        {
            require(category == Lib.Category.CHANGE_QUOTA || category == Lib.Category.SPENT, "Wrong category");
        }
        Lib.Topic memory newTopic = Lib.Topic({
            title: title,
            description: description,
            status: Lib.Status.IDLE,
            createDate: block.timestamp,
            startDate: 0,
            endDate: 0,
            category: category,
            amount: amount,
            responsible: responsible != address(0) ? responsible: tx.origin
        });

        topics[keccak256(bytes(title))] = newTopic;
    }

    function editTopic(
        string memory titleToEdit, string memory description, uint amount, address responsible
    ) external onlyManager returns(Lib.TopicUpdate memory)
    {
        Lib.Topic memory topic = getTopic(titleToEdit);
        require(topic.createDate > 0, "Topic does not exist");
        require(topic.status == Lib.Status.IDLE, "Only IDLE topics can be edited" );

        bytes32 topicID = keccak256(bytes(titleToEdit));

        if(bytes(description).length > 0)
            topics[topicID].description = description;
        if(amount >= 0 && amount != topics[topicID].amount){
            require(topics[topicID].category == Lib.Category.SPENT || topics[topicID].category == Lib.Category.CHANGE_QUOTA, "Topic cannot change value");
            topics[topicID].amount = amount;            
        }
        if((topics[topicID].responsible != responsible) && (responsible != address(0)))
            topics[topicID].responsible = responsible;

        return Lib.TopicUpdate({
            id: topicID,
            title: topic.title,
            status: topic.status,
            category: topic.category
        });    
    }

    function removeTopic(string memory title) external onlyManager returns(Lib.TopicUpdate memory){
        Lib.Topic memory topic = getTopic(title);
        require(topic.createDate > 0, "Topic does not exist");
        require(topic.status == Lib.Status.IDLE, "Only IDLE topic can be removed");
        bytes32 topicID = keccak256(bytes(title)); 
        delete topics[topicID];

        return Lib.TopicUpdate({
            id: topicID,
            title: topic.title,
            status: Lib.Status.DELETED,
            category: topic.category
        });    
    }

    function openVoting(string memory title) external onlyManager returns(Lib.TopicUpdate memory){
        Lib.Topic memory topic = getTopic(title);
        require(topic.createDate > 0, "Topic does not exist");
        require(topic.status == Lib.Status.IDLE, "Only IDLE topic can be open for voting");

        bytes32 topicID = keccak256(bytes(title));

        topics[topicID].status = Lib.Status.VOTING; 
        topics[topicID].startDate = block.timestamp; 
        return Lib.TopicUpdate({
            id: topicID,
            title: topic.title,
            status: Lib.Status.VOTING,
            category: topic.category
        });            
    }

    function vote(string memory title, Lib.Options option) external onlyResidents{
        require( option != Lib.Options.EMPTY, "The option cannot be EMPTY");

        Lib.Topic memory topic = getTopic(title);
        require(topic.createDate > 0, "Topic does not exist");
        require(topic.status == Lib.Status.VOTING, "Only VOTING topic can be voted");

        //uint16 residence = residents[msg.sender];
        uint16 residence = residents[tx.origin];

        bytes32 topicId = keccak256(bytes(title));

        Lib.Vote[] memory votes = votings[topicId];

        for(uint8 i = 0; i < votes.length; i++){
            //if(votes[i].residence == residence)
            //    require(false, "A residence should vote only once");
            require(votes[i].residence != residence, "A residence should vote only once");
        }

        Lib.Vote memory newVote = Lib.Vote({
            residence: residence,
            //resident: msg.sender,
            resident: tx.origin,
            option: option,
            timestamp: block.timestamp
        });

        votings[topicId].push(newVote);
    }

    function closeVoting(string memory title) external onlyManager returns(Lib.TopicUpdate memory) {
        Lib.Topic memory topic = getTopic(title);
        require(topic.createDate > 0, "Topic does not exist");
        require(topic.status == Lib.Status.VOTING, "Only VOTING topic can be closed");

        uint8 minimumVotes = 5;
        if(topic.category == Lib.Category.SPENT)
            minimumVotes = 10;
        else if(topic.category == Lib.Category.CHANGE_MANAGER)
            minimumVotes = 15;
        else if(topic.category == Lib.Category.CHANGE_QUOTA)
            minimumVotes = 20;    
        
        require(numberOfVotes(title) >= minimumVotes, "You cannot finish a topic without the minimum number of votes");

        uint8 approved = 0;
        uint8 denied = 0;
        uint8 abstention = 0;
        bytes32 topicId = keccak256(bytes(title));

        Lib.Vote[] memory votes = votings[topicId];

        for(uint8 i = 0; i < votes.length; i++){

            if(votes[i].option == Lib.Options.YES)
                approved++;
            else if(votes[i].option == Lib.Options.NO)
                denied++;
            else 
                abstention++;        
        }

        Lib.Status newStatus = approved > denied
            ? Lib.Status.APPROVED
            : Lib.Status.DENIED;

        /*
        if(approved > denied)
            topics[topicId].status = Lib.Status.APPROVED; 
        else    
            topics[topicId].status = Lib.Status.DENIED; 
            */
            
        topics[topicId].status = newStatus;
        topics[topicId].endDate = block.timestamp;

        if(newStatus == Lib.Status.APPROVED)
        {
            if(topic.category == Lib.Category.CHANGE_QUOTA){
                monthlyQuota = topic.amount;
            }
            else if(topic.category == Lib.Category.CHANGE_MANAGER){
                manager = topic.responsible;
            }
        } 

        return Lib.TopicUpdate({
            id: topicId,
            title: topic.title,
            status: newStatus,
            category: topic.category
        });    
    }

    function numberOfVotes(string memory title) public view returns (uint8){
        bytes32 topicID = keccak256(bytes(title));
        return uint8(votings[topicID].length);
    }

    function payQuota(uint16 residenceID) external payable{
        require(residenceExists(residenceID), "The residence does not exist");
        require(msg.value >= monthlyQuota, "Wrong value");
        //require(block.timestamp > payments[residents[tx.origin]] + (30 * 24 * 60 * 60), "You cannot pay twice a month");
        require(block.timestamp > payments[residenceID] + (30 * 24 * 60 * 60), "You cannot pay twice a month");
        payments[residenceID] = block.timestamp;
    }

    function transfer(string memory topicTitle, uint amount) external onlyManager returns(Lib.TransferReceipt memory){
        require(address(this).balance >= amount, "Insufficient funds");
        require(topicExists(topicTitle), "Topic does not exist");
        Lib.Topic memory topic = getTopic(topicTitle);

        require(topic.status == Lib.Status.APPROVED && topic.category == Lib.Category.SPENT, "Only APPROVED STPENT topics allowed");
        require(topic.amount >= amount, "Amount must be less or equal the approved amount");

        //Mudar o status para evitar reentrance
        bytes32 topicID = keccak256(bytes(topicTitle));
        topics[topicID].status = Lib.Status.SPENT;

        payable(topic.responsible).transfer(amount);

        return Lib.TransferReceipt({
            to: topic.responsible,
            amount: amount,
            topic: topicTitle
        });

    }
    function getManager() external view returns(address){
        return manager;
    }

    function getQuota() external view returns(uint){
        return monthlyQuota;
    }    
}
