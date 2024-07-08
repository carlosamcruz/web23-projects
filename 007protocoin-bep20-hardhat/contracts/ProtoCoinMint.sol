// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ProtoCoinMint is ERC20 {

    address private _owner;
    uint private _mintAmount = 0;
    uint64 private _mintDelay = 60 * 60 * 24; // 1 dia em segundos;

    mapping(address => uint256) private nextMint;

    constructor() ERC20("ProtoCoinMint", "PRCM") {
        _owner = msg.sender;
        _mint(msg.sender, 21000 * 10 ** 18);
    }


    function mint() public{
        require (_mintAmount > 0, "Mint is not enabled.");
        require (block.timestamp > nextMint[msg.sender], "You cannot mint twice in a day.");
        _mint(msg.sender, _mintAmount);
        nextMint[msg.sender] = block.timestamp + _mintDelay;
    }

    function setMintAmount(uint256 newAmount) public restricted {
        _mintAmount = newAmount;
    }

    function setMintDelay(uint64 delayInSeconds) public restricted {
        _mintDelay = delayInSeconds;
    }    

    modifier restricted() {
        require (_owner == msg.sender, "You do not have permission.");
        _;
    }
}