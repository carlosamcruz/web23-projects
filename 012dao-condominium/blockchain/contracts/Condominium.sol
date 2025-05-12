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

    //mapping (address => uint16) public residents; //wallet => unidades (1101) (2505)
    Lib.Resident[] public residents;
    mapping (address => uint) private _residentIndex; //wallet => array index

    //mapping (address => bool) public counselors; //conselheiro => true
    address[] public counselors;

    //mapping (uint16 => uint) public payments; //unidade => ultimo pagamento (timestamp em segundos)
    mapping (uint16 => uint) private _nextPayments; //unidade/apartamento => próximo pagamento (timestamp em segundos)

    //mapping(bytes32 => Lib.Topic) public topics;
    Lib.Topic[] public topics;
    mapping(bytes32 => uint) private _topicIndex; //topic hash => array index

    mapping(bytes32 => Lib.Vote[]) private _votings;
    
    uint private constant _thirtyDays = 30 * 24 * 60 * 60;

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
        require(tx.origin == manager || _isCounselor(tx.origin), "Only the manager or the council can do this");
        _;
    }

    /**
     * Apenas moradores adimplentes podem acessar as funções de moradores;
     */
    modifier onlyResidents () {
        if(tx.origin != manager){
            require(isResident(tx.origin), "Only the manager or the residents can do this");
            Lib.Resident memory resident = _getResident(tx.origin);
            require(
                //block.timestamp <= _nextPayments[resident.residence], "The resident must be defaulter");
                block.timestamp <= resident.nextPayment, "The resident must be defaulter");
        }
        _;
    }

    modifier validAddress (address add) {
        require(add != address(0), "Invalid address");
        _;
    }    

    //Verificar
    function residenceExists(uint16 residenceId) public view returns(bool){
        return residences[residenceId];
    }


    //RESIDENT FUCTIONS


    function isResident(address resident) public view returns (bool) {
        return _getResident(resident).residence  > 0;
    }

    //refac 2
    function addResident (address resident, uint16 residenceId) external onlyCouncil validAddress(resident){
        require(residenceExists(residenceId), "This residence does not exist");
        residents.push(Lib.Resident({
            wallet: resident,
            residence: residenceId,
            isCounselor: false,
            isManager: resident == manager,
            nextPayment: 0
        }));
        _residentIndex[resident] = (residents.length - 1);
    }

    function removeResident (address resident) external onlyManager {
        //if (_isCounselor(resident)) delete counselors[resident];
        //require(!counselors[resident], "A counselor cannot be removed");
        require(!_isCounselor(resident), "A counselor cannot be removed");
        uint index = _residentIndex[resident];

        if(index != (residents.length - 1)){

            Lib.Resident memory latest = residents[residents.length - 1];
            residents[index] = latest;
            //atualiza o mapping de index de moradores, para que o index o último morador que passou a existir em no 
            //index do morador que foi removido, agora precisa se atualizado.
            _residentIndex[latest.wallet] = index;
        }

        //remove o último elemento do array
        residents.pop();
        //agora remove o index 
        delete _residentIndex[resident];
    }

    //refac 2
    function _getResident(address resident) private view returns(Lib.Resident memory){
        uint index = _residentIndex[resident];
        if(index < residents.length){
            Lib.Resident memory result = residents[index];

            //Esta condição é necessário pois a busca por mapping, se não for encontrado nada ele retorna 0
            //Mas 0 é indice válido no nosso array;  
            if(result.wallet ==  resident){

                //o mapping de _nextPayments não conecta direto com o residents
                result.nextPayment = _nextPayments[result.residence];
                return (result);
            }
                
        }
        return Lib.Resident ({
            wallet: address(0),
            residence: 0,
            isCounselor: false,
            isManager: false, 
            nextPayment: 0
        });
    } 

    function getResident(address resident) external view returns(Lib.Resident memory){
        return _getResident(resident);
    } 

    //refac 2
    function getResidents(uint page, uint pageSize) external view returns(Lib.ResidentPage memory){
        //Lib.Resident [] memory result = new Lib.Resident[pageSize];
        //soluçõ do chatGpt
        Lib.Resident [] memory result = new Lib.Resident[](pageSize);

        uint skip = (page - 1) * pageSize;
        uint index = 0;

        for(uint i = skip; i < (skip + pageSize) && i < residents.length; i ++){

            result[index] = _getResident(residents[i].wallet);
            //result[index] = residents[i];
            index++;
        }

        return Lib.ResidentPage({
            residents: result,
            total: residents.length
        });
    }


    //COUNSELOR FUNCTIONS

    function _isCounselor (address resident) private view returns (bool){

        for(uint i = 0; i < counselors.length; i ++)
        {
            if(counselors[i] == resident)
                return true;
        }
        return false;
    }

    function _addCounselor(address counselor) private onlyManager validAddress(counselor) {

        require(isResident(counselor), "The counselor must be a resident");
        counselors.push(counselor);
        residents[_residentIndex[counselor]].isCounselor = true;
    }

    function _removeCounselor(address counselor) private onlyManager validAddress(counselor) {
        uint index = 0;
        bool validIndex = false;

        for(uint i = 0; i < counselors.length; i++)
            if(counselors[i] == counselor){
                index = i;
                validIndex = true;
                break;
            }
        require(validIndex, "Counselor not found");

        if(index != (counselors.length - 1)){

            address latest = counselors[counselors.length - 1];
            counselors[index] = latest;
        }

        //remove o último elemento do array
        counselors.pop();
        residents[_residentIndex[counselor]].isCounselor = false;
    }

    function setCounselor (address resident, bool isEntering) external{
        if(isEntering)
            _addCounselor(resident);
        else 
            _removeCounselor(resident);
    }

    /*
    function setManager(address newManager) external onlyManager{
        require(newManager != address(0), "Address must be valid");
        manager = newManager;
    }
    */

    //refac 2
    function _getTopic(string memory title) private view returns (Lib.Topic memory){
        bytes32 topicId = keccak256(bytes(title));
        uint index = _topicIndex[topicId];

        if(index < topics.length){
            Lib.Topic memory result = topics[index];
            //if(index >= 0 || keccak256(bytes(result.title)) == topicId)
            if(keccak256(bytes(result.title)) == topicId)
                return result;

        }

        return Lib.Topic({
            title: "",
            description: "",
            status: Lib.Status.DELETED,
            createDate: 0,
            startDate: 0,
            endDate: 0,
            category: Lib.Category.DECISION,
            amount: 0,
            responsible: address(0)
        });
    }

    function getTopic(string memory title) external view returns(Lib.Topic memory){
        return _getTopic(title);
    }

    //refa 2
    function getTopics(uint page, uint pageSize) external view returns(Lib.TopicPage memory){

        //Lib.Topic [] memory result = new Lib.Topic[pageSize];
        //soluçõ do chatGpt
        Lib.Topic [] memory result = new Lib.Topic[](pageSize);

        uint skip = (page - 1) * pageSize;
        uint index = 0;

        for(uint i = skip; i < (skip + pageSize) && i < topics.length; i ++){
            result[index] = topics[i];
            index++;
        }

        return Lib.TopicPage({
            topics: result,
            total: topics.length
        });
    }

    function topicExists(string memory title) public view returns(bool){
        return _getTopic(title).createDate > 0;
    }

    //refac 2
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

        topics.push(newTopic);
        _topicIndex[keccak256(bytes(title))] = topics.length - 1;
    }

    //refac 2
    function editTopic(
        string memory titleToEdit, string memory description, uint amount, address responsible
    ) external onlyManager returns(Lib.TopicUpdate memory)
    {
        Lib.Topic memory topic = _getTopic(titleToEdit);
        require(topic.createDate > 0, "Topic does not exist");
        require(topic.status == Lib.Status.IDLE, "Only IDLE topics can be edited" );

        bytes32 topicId = keccak256(bytes(titleToEdit));
        uint index = _topicIndex[topicId];

        if(bytes(description).length > 0)
            topics[index].description = description;
        if(amount >= 0 && amount != topics[index].amount){
            require(topics[index].category == Lib.Category.SPENT || topics[index].category == Lib.Category.CHANGE_QUOTA, "Topic cannot change value");
            topics[index].amount = amount;            
        }
        if((topics[index].responsible != responsible) && (responsible != address(0)))
            topics[index].responsible = responsible;

        return Lib.TopicUpdate({
            id: topicId,
            title: topic.title,
            status: topic.status,
            category: topic.category
        });    
    }

    //refac 2
    function removeTopic(string memory title) external onlyManager returns(Lib.TopicUpdate memory){
        Lib.Topic memory topic = _getTopic(title);
        require(topic.createDate > 0, "Topic does not exist");
        require(topic.status == Lib.Status.IDLE, "Only IDLE topic can be removed");
        bytes32 topicID = keccak256(bytes(title)); 

        uint index = _topicIndex[topicID];

        if(index != (topics.length - 1)){

            Lib.Topic memory latest = topics[topics.length - 1];
            topics[index] = latest;
            //atualiza o mapping de index de moradores, para que o index o último morador que passou a existir em no 
            //index do morador que foi removido, agora precisa se atualizado.
            _topicIndex[keccak256(bytes(latest.title))] = index;
        }

        //remove o último elemento do array
        topics.pop();
        //agora remove o index 
        delete _topicIndex[topicID];

        return Lib.TopicUpdate({
            id: topicID,
            title: topic.title,
            status: Lib.Status.DELETED,
            category: topic.category
        });    
    }

    //VOTING FUNCTIONS

    //refac 2
    function openVoting(string memory title) external onlyManager returns(Lib.TopicUpdate memory){
        Lib.Topic memory topic = _getTopic(title);
        require(topic.createDate > 0, "Topic does not exist");
        require(topic.status == Lib.Status.IDLE, "Only IDLE topic can be open for voting");

        bytes32 topicId = keccak256(bytes(title));
        uint index = _topicIndex[topicId];

        topics[index].status = Lib.Status.VOTING; 
        topics[index].startDate = block.timestamp; 
        return Lib.TopicUpdate({
            id: topicId,
            title: topic.title,
            status: Lib.Status.VOTING,
            category: topic.category
        });            
    }

    function vote(string memory title, Lib.Options option) external onlyResidents{
        require( option != Lib.Options.EMPTY, "The option cannot be EMPTY");

        Lib.Topic memory topic = _getTopic(title);
        require(topic.createDate > 0, "Topic does not exist");
        require(topic.status == Lib.Status.VOTING, "Only VOTING topic can be voted");

        //uint16 residence = residents[msg.sender];
        //uint16 residence = residents[tx.origin];
        uint index = _residentIndex[tx.origin];
        uint16 residence = residents[index].residence;

        bytes32 topicId = keccak256(bytes(title));

        Lib.Vote[] memory votes = _votings[topicId];

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

        _votings[topicId].push(newVote);
    }

    function getVotes(string memory topicTitle ) external view returns(Lib.Vote[] memory){
        return _votings[keccak256(bytes(topicTitle))];
    }

    //refac 2
    function closeVoting(string memory title) external onlyManager returns(Lib.TopicUpdate memory) {
        Lib.Topic memory topic = _getTopic(title);
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

        Lib.Vote[] memory votes = _votings[topicId];

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

        uint index = _topicIndex[topicId];

        /*
        if(approved > denied)
            topics[topicId].status = Lib.Status.APPROVED; 
        else    
            topics[topicId].status = Lib.Status.DENIED; 
            */
            
        topics[index].status = newStatus;
        topics[index].endDate = block.timestamp;

        if(newStatus == Lib.Status.APPROVED)
        {
            if(topic.category == Lib.Category.CHANGE_QUOTA){
                monthlyQuota = topic.amount;
            }
            else if(topic.category == Lib.Category.CHANGE_MANAGER){

                if(isResident(manager))
                    residents[_residentIndex[manager]].isManager = false;

                manager = topic.responsible;

                if(isResident(topic.responsible))
                    residents[_residentIndex[topic.responsible]].isManager = true;

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
        return uint8(_votings[topicID].length);
    }

    //refac 2
    function payQuota(uint16 residenceId) external payable{
        require(residenceExists(residenceId), "The residence does not exist");
        require(msg.value >= monthlyQuota, "Wrong value");
        //require(block.timestamp > payments[residents[tx.origin]] + (30 * 24 * 60 * 60), "You cannot pay twice a month");
        require(block.timestamp > _nextPayments[residenceId], "You cannot pay twice a month");

        if(_nextPayments[residenceId] == 0)
            _nextPayments[residenceId] = block.timestamp + _thirtyDays;
        else
            _nextPayments[residenceId] += _thirtyDays;

    }

    //refac 2
    function transfer(string memory topicTitle, uint amount) external onlyManager returns(Lib.TransferReceipt memory){
        require(address(this).balance >= amount, "Insufficient funds");
        require(topicExists(topicTitle), "Topic does not exist");
        Lib.Topic memory topic = _getTopic(topicTitle);

        require(topic.status == Lib.Status.APPROVED && topic.category == Lib.Category.SPENT, "Only APPROVED STPENT topics allowed");
        require(topic.amount >= amount, "Amount must be less or equal the approved amount");

        //Mudar o status para evitar reentrance
        bytes32 topicId = keccak256(bytes(topicTitle));
        uint index = _topicIndex[topicId];


        topics[index].status = Lib.Status.SPENT;

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
