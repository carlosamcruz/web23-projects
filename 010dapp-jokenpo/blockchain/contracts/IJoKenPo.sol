// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./JKPLibrary.sol";

interface IJoKenPo{

    //External functions requires less gas than public functions
    function getResult() external view returns (string memory);

    //External functions requires less gas than public functions
    function getBid() external view returns (uint256);

    //External functions requires less gas than public functions
    function getComission() external view returns (uint8);

    function setBid(uint256 newBid) external;

    function setComission(uint8 newComission) external;

    function getBalance() external view returns (uint);

    function play(JKPLibrary.Options newChoice) external payable returns(string memory);

    function getLeaderboard() external view returns (JKPLibrary.Player[] memory);
}
