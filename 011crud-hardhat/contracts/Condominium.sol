// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Condominium {
    address public manager;//Ownable
    mapping (uint16 => bool) public residences; //unidades => true
    mapping (address => uint16) public residents; //wallet => unidades (1101) (2505)
    mapping (address => bool) public counselors; //conselheiro => true

    enum Status{
        IDLE,
        VOLTING,
        APPROVED,
        DENIED
    }// 0, 1, 2 3

    struct  Topic {
        string title;
        string description;
        Status status;
        uint256 createDate;
        uint256 startDate;
        uint256 endDate;
    }

    mapping(bytes32 => Topic) public topics;


    constructor(){
        manager = msg.sender;

        //condiminio de 2 blocos, 5 andares por bloco, e 5 unidade por andar;

        //Laço para os blocos do condominio
        for(uint8 i = 1; i <=2; i ++){
            //Laço para os andarede do condominio
            for(uint8 j = 1; j <=5; j ++){
                //Laço para as unidades de cada andar
                for(uint8 k = 1; k <=5; k ++){

                    unchecked{//Usar se eu garanto que a operação não vai dar estouro no uint16
                        residences[1000*i + 100*j + k] = true;
                    }
                }
            }
        }
    }

    modifier onlyManager {
        require(msg.sender == manager, "Only the manager can do this");
        _;
    }

    modifier onlyCouncil {
        require(msg.sender == manager || counselors[msg.sender], "Only the manager or the council can do this");
        _;
    }

    modifier onlyResidents {
        require(msg.sender == manager || isResident(msg.sender), "Only the manager or the residents can do this");
        _;
    }

    function residenceExists(uint16 residenceId) public view returns(bool){
        return residences[residenceId];
    }

    function isResident(address resident) public view returns (bool) {
        return residents[resident] > 0;
    }

    function addResident (address resident, uint16 residenceId) external onlyCouncil {
        require(residenceExists(residenceId), "This residence does not exist");
        residents[resident] = residenceId;
    }

    function removeResident (address resident) external onlyManager {
        if (counselors[resident]) delete counselors[resident];
        //require(!counselors[resident], "A counselor cannot be removed");
        delete residents[resident];
    }

    function setCounselor (address resident, bool isEntering) external onlyManager{
        if(isEntering)
        {
            require(isResident(resident), "The counselor must be a resident");
            counselors[resident] = true;
        }
        else 
            //counselors[resident] = false;
            delete counselors[resident];

    }

    function setManager(address newManager) external onlyManager{
        require(newManager != address(0), "Address must be valid");
        manager = newManager;
    }

    function getTopic(string memory title) public view returns (Topic memory){
        bytes32 topicId = keccak256(bytes(title));
        return topics[topicId];
    }

    function topicExists(string memory title) public view returns(bool){
        return getTopic(title).createDate > 0;
    }

    function addTopic(string memory title, string memory description) external onlyResidents{
        require(!topicExists(title), "This topic already exists");
        Topic memory newTopic = Topic({
            title: title,
            description: description,
            status: Status.IDLE,
            createDate: block.timestamp,
            startDate: 0,
            endDate: 0
        });

        topics[keccak256(bytes(title))] = newTopic;
    }

    function removeTopic(string memory title) external onlyManager{
        Topic memory topic = getTopic(title);
        require(topic.createDate > 0, "Topic does not exist");
        require(topic.status == Status.IDLE, "Only IDLE topic can be removed");
        delete topics[keccak256(bytes(title))];
    }
}
