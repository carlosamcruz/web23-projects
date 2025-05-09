// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

library Strings {
    bytes16 private constant HEX_DIGITS = "0123456789abcdef";
    uint8 private constant ADDRESS_LENGTH = 20;

    /**
     * @dev The `value` string doesn't fit in the specified `length`.
     */
    error StringsInsufficientHexLength(uint256 value, uint256 length);

        /**
     * @dev Return the log in base 10 of a positive value rounded towards zero.
     * Returns 0 if given 0.
     */
    function log10(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >= 10 ** 64) {
                value /= 10 ** 64;
                result += 64;
            }
            if (value >= 10 ** 32) {
                value /= 10 ** 32;
                result += 32;
            }
            if (value >= 10 ** 16) {
                value /= 10 ** 16;
                result += 16;
            }
            if (value >= 10 ** 8) {
                value /= 10 ** 8;
                result += 8;
            }
            if (value >= 10 ** 4) {
                value /= 10 ** 4;
                result += 4;
            }
            if (value >= 10 ** 2) {
                value /= 10 ** 2;
                result += 2;
            }
            if (value >= 10 ** 1) {
                result += 1;
            }
        }
        return result;
    }


    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        unchecked {
            uint256 length = log10(value) + 1;
            string memory buffer = new string(length);
            uint256 ptr;
            /// @solidity memory-safe-assembly
            assembly {
                ptr := add(buffer, add(32, length))
            }
            while (true) {
                ptr--;
                /// @solidity memory-safe-assembly
                assembly {
                    mstore8(ptr, byte(mod(value, 10), HEX_DIGITS))
                }
                value /= 10;
                if (value == 0) break;
            }
            return buffer;
        }
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        uint256 localValue = value;
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = HEX_DIGITS[localValue & 0xf];
            localValue >>= 4;
        }
        if (localValue != 0) {
            revert StringsInsufficientHexLength(value, length);
        }
        return string(buffer);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal
     * representation.
     */
    function toHexString(address addr) internal pure returns (string memory) {
        return toHexString(uint256(uint160(addr)), ADDRESS_LENGTH);
    }

    /**
     * @dev Returns true if the two strings are equal.
     */
    function equal(string memory a, string memory b) internal pure returns (bool) {
        return bytes(a).length == bytes(b).length && keccak256(bytes(a)) == keccak256(bytes(b));
    }
}


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