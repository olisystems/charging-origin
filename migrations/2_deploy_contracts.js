const ChargingOrigin = artifacts.require("ChargingOrigin");
const Test = artifacts.require("Test");

module.exports = function (deployer) {

    deployer.deploy(ChargingOrigin);
    deployer.deploy(Test);
};