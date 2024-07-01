// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";

contract ParOuImpar{

    string public choicePlayer1 = ""; //EVEN or ODD
    address public  player1;
    uint8 private numberPlayer1;
    string public status = "";

    function compare(string memory str1, string memory str2) private pure returns (bool){
        bytes memory arrA = bytes(str1);
        bytes memory arrB = bytes(str2);

        return arrA.length == arrB.length && keccak256(arrA) == keccak256(arrB);
    }

    function choose (string memory newChoice) public {
        require(compare(newChoice, "EVEN") || compare(newChoice, "ODD"), "Choose EVEN or ODD");

        string memory message = string.concat("Player1 already chose: ", choicePlayer1);

        require(compare(choicePlayer1, ""), message);

        choicePlayer1 = newChoice;
        player1 = msg.sender;

        status = string.concat("Player 1 is ", Strings.toHexString(player1), " and chose ", choicePlayer1);
    }

    /*
    function random () private view returns(uint8){

        return  uint8 (uint(keccak256(abi.encodePacked(block.timestamp, choicePlayer1))) % 256) % 2;
    }
    */

    function play (uint8 number) public{

        //require(number >=0 && number <=2, "Play 0, 1, or 2");
        require(!compare(choicePlayer1, ""), "first choose your option: EVEN or ODD!");
        require(number > 0, "The number must be grater than 0.");

        //uint8 cpuNumber = random();

        if(msg.sender == player1){
            numberPlayer1 = number;
            status = "Player 1 already played. Waiting player 2 ...";
        }
        else{

            require(numberPlayer1 != 0, "Player 1 needs to play first.");

            bool isEven = (number + numberPlayer1) % 2 == 0;

            string memory message = string.concat(
                "Player 1 choose ",
                choicePlayer1,
                " and plays ",
                Strings.toString(numberPlayer1),
                ". Player2 plays ",
                Strings.toString(number)
            );


            if(isEven && compare(choicePlayer1, "EVEN"))
                status = string.concat(message, " Player1 won!");
            else if(!isEven && compare(choicePlayer1, "ODD"))
                status = string.concat(message, " Player1 won!");
            else 
                status = string.concat(message, " Player2 won!");    

            choicePlayer1 = "";
            numberPlayer1 = 0;
            player1 = address(0);    

        }
    }
}