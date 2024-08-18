// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library CondominiumLib {

    enum Status{
        IDLE,
        VOLTING,
        APPROVED,
        DENIED,
        SPENT
    }// 0, 1, 2 3

    enum Options{
        EMPTY,
        YES,
        NO,
        ABSTENTION
    }// 0, 1, 2 3

    enum Category{
        DECISION,
        SPENT,
        CHANGE_QUOTA,
        CHANGE_MANAGER
    }// 0, 1, 2 3    

    struct  Topic {
        string title;
        string description;
        Status status;
        uint256 createDate;
        uint256 startDate;
        uint256 endDate;
        Category category;
        uint amount;
        address responsible;
    }

    struct Vote{
        address resident;
        uint16 residence;
        Options option;
        uint256 timestamp;
    }
}