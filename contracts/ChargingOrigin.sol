pragma solidity >=0.4.16 <0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract ChargingOrigin {
    using SafeMath for uint256;

    // data variables
    uint256 public totalConsumption;
    uint256 public totalProduction;
    uint256 public totalUlmProduction;
    uint256 public totalXameshProduction;

    // events
    event Consumption(address consumer, uint256 consumption, uint256 timestamp);
    event Production(address producer, string name, uint256 production, uint256 timestamp);

    // functions
    function sendConsumption(uint256 _consumption) public {
        totalConsumption = totalConsumption.add(_consumption);
        emit Consumption(msg.sender, _consumption, block.timestamp);
    }

    function sendProduction(uint256 _production, string memory _name) public {
        if (keccak256(bytes(_name)) == keccak256('ULM PV')) {
            totalUlmProduction = totalUlmProduction.add(_production);
        } else if (keccak256(bytes(_name)) == keccak256('Xamesh')) {
            totalXameshProduction = totalXameshProduction.add(_production);
        }

        totalProduction = totalProduction.add(_production);
        emit Production(msg.sender, _name, _production, block.timestamp);
    }

}