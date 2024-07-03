// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract JoKenPo{

    enum Options {NONE, ROCK, PAPER, SCISSORS} // 0, 1, 2 , 3

    Options private choice1 = Options.NONE;
    address private player1;
    string public result = "";

    address payable private immutable owner;

    //address[] players = new address[](0);
    address[] public players;

    constructor(){
        owner = payable (msg.sender);
    }

    function exists(address winner) private view returns (bool) {
        for(uint i = 0; i < players.length; i ++){
            if (players[i] == winner) return true;
        }
        return false;
    }


    function finishGame(string memory newResult, address winner) private {

        address contractAddress = address(this);
        payable(winner).transfer((contractAddress.balance / 100) * 90);

        //O resto do balance vai para o dono;
        owner.transfer(contractAddress.balance);

        if(!exists(winner))
            players.push(winner);

        //players.pop(); //Remove a ultima posição
        //delete players[2]; //Deleta o elemento da terceira posição;
        //players[2] = address(0); //Deleta o elemento da terceira posição;

        result = newResult;
        player1 = address(0);
        choice1 = Options.NONE;
    }

    function getBalance() public view returns (uint){
        require(msg.sender == owner, "You do not have this permission.");
        return address(this).balance;
    } 

    function play(Options newChoice) public payable {
        require(newChoice != Options.NONE, "Invalid choice."); 
        require(player1 != msg.sender, "Wait the other player.");
        require (msg.value >= 0.01 ether, "Invalid Bid.");

        if(choice1 == Options.NONE){
            player1 = msg.sender;
            choice1 = newChoice;
            result = "Player 1 chose his/her option. Waiting player 2.";
        }
        else if(choice1 == Options.ROCK && newChoice == Options.SCISSORS){
            finishGame("Rock breaks scissors, Player 1 won.", player1);
        }
        else if(choice1 == Options.PAPER && newChoice == Options.ROCK){
            finishGame("Paper wraps rock, Player 1 won.", player1);
        }        
        else if(choice1 == Options.SCISSORS && newChoice == Options.PAPER){
            finishGame("Scissors cuts paper, Player 1 won.", player1);
        }
        else if(choice1 == Options.SCISSORS && newChoice == Options.ROCK){
            finishGame("Rock breaks scissors, Player 2 won.", msg.sender);
        }
        else if(choice1 == Options.ROCK && newChoice == Options.PAPER){
            finishGame("Paper wraps rock, Player 2 won.", msg.sender);
        }        
        else if(choice1 == Options.PAPER && newChoice == Options.SCISSORS){
            finishGame("Scissors cuts paper, Player 2 won.", msg.sender);
        }
        else{
            result = "Game tied. The prize has increased.";
            player1 = address(0);
            choice1 = Options.NONE;
        }
    }
}

