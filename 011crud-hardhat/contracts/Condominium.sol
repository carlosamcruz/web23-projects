// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Condominium {
    address public manager;//Ownable
    mapping (uint16 => bool) public residences; //unidades => true
    mapping (address => uint16) public residents; //wallet => unidades (1101) (2505)
    mapping (address => bool) public counselors; //conselheiro => true

    constructor(){
        manager = msg.sender;

        //condiminio de 2 blocos, 5 andares por bloco, e 5 unidade por andar;

        //Laço para os blocos do condominio
        for(uint8 i = 1; i <=2; i ++){
            //Laço para os andarede do condominio
            for(uint8 j = 1; j <=5; j ++){
                //Laço para as unidades de cada andar
                for(uint8 k = 1; k <=5; k ++){

                    unchecked{//Usar se eu garanto que a operação não vai dar estouro no uint16
                        residences[1000*i + 100*j + k] = true;
                    }
                }
            }
        }
    }

    modifier onlyManager {
        require(msg.sender == manager, "Only the manager can do this");
        _;
    }

    modifier onlyCouncil {
        require(msg.sender == manager || counselors[msg.sender], "Only the manager or the council can do this");
        _;
    }

    modifier onlyResidents {
        require(msg.sender == manager || isResident(msg.sender), "Only the manager or the residents can do this");
        _;
    }

    function residenceExists(uint16 residenceId) public view returns(bool){
        return residences[residenceId];
    }

    function isResident(address resident) public view returns (bool) {
        return residents[resident] > 0;
    }
}
