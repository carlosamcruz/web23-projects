// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ProtoCoin is ERC20 {
    constructor() ERC20("ProtoCoin", "PRC") {
        _mint(msg.sender, 21000 * 10 ** 18);
    }
}