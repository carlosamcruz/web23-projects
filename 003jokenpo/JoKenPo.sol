// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract JoKenPo{

    enum Options {NONE, ROCK, PAPER, SCISSORS} // 0, 1, 2 , 3

    Options private choice1 = Options.NONE;
    address private player1;
    string public result = "";

    function play(Options newChoice) public {
        require(newChoice != Options.NONE, "Invalid choice."); 
        require(player1 != msg.sender, "Wait the other player.");

        if(choice1 == Options.NONE){
            player1 = msg.sender;
            choice1 = newChoice;
            result = "Player 1 chose his/her option. Waiting player 2.";
        }
        else if(choice1 == Options.ROCK && newChoice == Options.SCISSORS){
            result = "Rock breaks scissors, Player 1 won.";
        }
        else if(choice1 == Options.PAPER && newChoice == Options.ROCK){
            result = "Paper wraps rock, Player 1 won.";
        }        
        else if(choice1 == Options.SCISSORS && newChoice == Options.PAPER){
            result = "Scissors cuts paper, Player 1 won.";
        }
        else if(choice1 == Options.SCISSORS && newChoice == Options.ROCK){
            result = "Rock breaks scissors, Player 2 won.";
        }
        else if(choice1 == Options.ROCK && newChoice == Options.PAPER){
            result = "Paper wraps rock, Player 2 won.";
        }        
        else if(choice1 == Options.PAPER && newChoice == Options.SCISSORS){
            result = "Scissors cuts paper, Player 2 won.";
        }
        else{
            result = "Game tied.";
        }

        if(newChoice != choice1){
            player1 = address(0);
            choice1 = Options.NONE;
        }
    }


}
