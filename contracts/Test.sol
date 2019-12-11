pragma solidity >=0.4.16 <0.6.0;

contract Test {

uint256 data;

event Data(uint256 data);

function setData(uint256 _data)public{
    data =_data;
    emit Data(_data);
}

}