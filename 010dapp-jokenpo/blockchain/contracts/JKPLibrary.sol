// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library JKPLibrary {
    
    enum Options {NONE, ROCK, PAPER, SCISSORS} // 0, 1, 2 , 3

    struct Player {
        address wallet;
        uint wins;
    }
}