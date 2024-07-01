// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12 <0.9.0;

contract HelloWorld {

  uint8 private _age = 45;

  function getAge() public view returns(uint8) {
    return _age;
  }

  function setAge(uint8 newAge) public {
    _age = newAge;
  }


}
