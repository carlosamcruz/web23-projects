// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IJoKenPo.sol";
import "./JKPLibrary.sol";

contract JKPAdapter {
    IJoKenPo private joKenPo;

    address public immutable owner;

    //Avisar os jogadores interessados que houve uma jogada;
    event Played(address indexed player, string result);
    //indexed custa mais caro

    constructor(){

        owner = msg.sender;

    }

    function getImplementationAddress() external view returns(address){
        return address(joKenPo);
    }

    function getResult() external view upgraded returns (string memory) {
        
        return joKenPo.getResult();
    }

        //External functions requires less gas than public functions
    function getBid() external view upgraded returns (uint256){
        return joKenPo.getBid();
    }

    //External functions requires less gas than public functions
    function getComission() external view upgraded returns (uint8){
        return joKenPo.getComission();
    }

    function setBid(uint256 newBid) external restricted upgraded{
        return joKenPo.setBid(newBid);
    }

    function setComission(uint8 newComission) external restricted upgraded{
        return joKenPo.setComission(newComission);
    }

    function getBalance() external view upgraded returns (uint){
        return joKenPo.getBalance();
    } 


    function play(JKPLibrary.Options newChoice) external payable upgraded{

        //return joKenPo.play{ value: msg.value }(newChoice);
        string memory result = joKenPo.play{ value: msg.value }(newChoice);
        emit Played(msg.sender, result);
    }

    function getLeaderboard() external view upgraded returns (JKPLibrary.Player[] memory) {
        return joKenPo.getLeaderboard();
    }


    modifier restricted() {
        require(msg.sender == owner, "You do not have permission");
        _;
    }    

    modifier upgraded() {
        require(address(joKenPo) != address(0), "You must upgrade first");
        _;
    }

    function upgrade(address newImplementation) external {
        require(msg.sender == owner, "You do not have permission");
        require(newImplementation != address(0), "Empty address is not permited");
        joKenPo = IJoKenPo(newImplementation);
    }

}