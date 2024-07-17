// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IJoKenPo.sol";
import "./JKPLibrary.sol";


contract JoKenPo is IJoKenPo{

    //enum Options {NONE, ROCK, PAPER, SCISSORS} // 0, 1, 2 , 3

    JKPLibrary.Options private choice1 = JKPLibrary.Options.NONE;
    address private player1;
    string private result = "";
    uint256 private bid = 0.01 ether;
    uint8 private comission = 10;//percentage

    address payable private immutable owner;

    /*
    struct Player {
        address wallet;
        uint wins;
    }
    */

    //address[] players = new address[](0);
    JKPLibrary.Player[] public players;

    constructor(){
        //owner = payable (tx.origin);//msg.sender);
        owner = payable (msg.sender);
    }

    //External functions requires less gas than public functions
    function getResult() external view returns (string memory){
        return result;
    }

    //External functions requires less gas than public functions
    function getBid() external view returns (uint256){
        return bid;
    }

    //External functions requires less gas than public functions
    function getComission() external view returns (uint8){
        return comission;
    }

    function setBid(uint256 newBid) external{
        require(tx.origin == owner, "You do not have permission");
        require(player1 == address(0), "You can not change the bid with a game in progress");
        bid = newBid;
    }

    function setComission(uint8 newComission) external{
        require(tx.origin == owner, "You do not have permission");
        require(player1 == address(0), "You can not change the comission with a game in progress");
        comission = newComission;
    }

    function updateWinner(address winner) private {
        for(uint i = 0; i < players.length; i ++){
            if (players[i].wallet == winner) {
                players[i].wins++;
                return;
            }
        }
        players.push(JKPLibrary.Player(winner, 1));
    }


    function finishGame(string memory newResult, address winner) private {

        address contractAddress = address(this);
        payable(winner).transfer((contractAddress.balance / 100) * (100 - comission));

        //O resto do balance vai para o dono;
        owner.transfer(contractAddress.balance);

        updateWinner(winner);

        result = newResult;
        player1 = address(0);
        choice1 = JKPLibrary.Options.NONE;
    }

    function getBalance() external view returns (uint){
        require(tx.origin == owner, "You do not have this permission");
        return address(this).balance;
    } 

    function play(JKPLibrary.Options newChoice) external payable {
        require(tx.origin != owner, "The owner cannot play");
        require(newChoice != JKPLibrary.Options.NONE, "Invalid choice"); 
        require(player1 != tx.origin, "Wait the other player");
        require (msg.value >= bid, "Invalid Bid");

        if(choice1 == JKPLibrary.Options.NONE){
            player1 = tx.origin;
            choice1 = newChoice;
            result = "Player 1 chose his/her option. Waiting player 2";
        }
        else if(choice1 == JKPLibrary.Options.ROCK && newChoice == JKPLibrary.Options.SCISSORS){
            finishGame("Rock breaks scissors, Player 1 won", player1);
        }
        else if(choice1 == JKPLibrary.Options.PAPER && newChoice == JKPLibrary.Options.ROCK){
            finishGame("Paper wraps rock, Player 1 won", player1);
        }        
        else if(choice1 == JKPLibrary.Options.SCISSORS && newChoice == JKPLibrary.Options.PAPER){
            finishGame("Scissors cuts paper, Player 1 won", player1);
        }
        else if(choice1 == JKPLibrary.Options.SCISSORS && newChoice == JKPLibrary.Options.ROCK){
            finishGame("Rock breaks scissors, Player 2 won", tx.origin);
        }
        else if(choice1 == JKPLibrary.Options.ROCK && newChoice == JKPLibrary.Options.PAPER){
            finishGame("Paper wraps rock, Player 2 won", tx.origin);
        }        
        else if(choice1 == JKPLibrary.Options.PAPER && newChoice == JKPLibrary.Options.SCISSORS){
            finishGame("Scissors cuts paper, Player 2 won", tx.origin);
        }
        else{
            result = "Game tied. The prize has increased";
            player1 = address(0);
            choice1 = JKPLibrary.Options.NONE;
        }
    }

    function getLeaderboard() external view returns (JKPLibrary.Player[] memory) {
        if (players.length < 2) return players;

        JKPLibrary.Player[] memory arr = new JKPLibrary.Player[](players.length);
        for (uint256 i = 0; i < players.length; i++) arr[i] = players[i];

        for (uint256 i = 0; i < arr.length - 1; i++) {
            for (uint256 j = 1; j < arr.length; j++) {
                if (arr[i].wins < arr[j].wins) {
                    JKPLibrary.Player memory change = arr[i];
                    arr[i] = arr[j];
                    arr[j] = change;
                }
            }
        }

        return arr;
    }
}
