pragma solidity >=0.4.16 <0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract ChargingOrigin {
    using SafeMath for uint256;

    // data variables
    uint256 public totalConsumption;
    uint256 public totalProduction;
    uint256 public totalThuPvProd;
    uint256 public totalExameshWppProd;

    // consumer struct
    struct Consumer {
        string name;
        uint32 latitude;
        uint32 longitude;
        bool isRegistered;
    }

    // list of registered consumer
    address[] public consumerList;

    // events
    event Consumption(address consumer, uint256 consumption, string location, uint256 timestamp);
    event Production(address producer, string name, uint256 production, uint256 timestamp);
    event ConsumerRegistration(address addressCP, string name, uint32 latitude, uint32 longitude);

    // map address to consumer
    mapping(address => Consumer)consumers;

    // functions
    // register consumer
    function registerConsumer(string memory _name, uint32 _latitude, uint32 _longitude) public {
        require(_isRegistered(msg.sender) != true, 'Consumer is already registered');
        consumers[msg.sender] = Consumer(_name, _latitude, _longitude, true);
        consumerList.push(msg.sender);
        emit ConsumerRegistration(msg.sender, _name, _latitude, _longitude);
    }

    // check registration
    function _isRegistered(address _address) internal view returns (bool status){
        status = consumers[_address].isRegistered;
        return status;
    }

    function sendConsumption(uint256 _consumption, string memory _location) public {
        require(_isRegistered(msg.sender) == true, 'Registration is required');
        totalConsumption = totalConsumption.add(_consumption);
        emit Consumption(msg.sender, _consumption, _location, block.timestamp);
    }

    function sendProduction(uint256 _production, string memory _name) public {
        if (keccak256(bytes(_name)) == keccak256('THU PV')) {
            totalThuPvProd = totalThuPvProd.add(_production);
        } else if (keccak256(bytes(_name)) == keccak256('Examesh WPP')) {
            totalExameshWppProd = totalExameshWppProd.add(_production);
        }

        totalProduction = totalProduction.add(_production);
        emit Production(msg.sender, _name, _production, block.timestamp);
    }

}