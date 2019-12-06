import web3 from './web3';
import chargingOriginArtifact from "./contracts/ChargingOrigin";

const ContractInstance = async () => {

    //This method find the network id to retrieve the configuration from truffle-config.js file
    const networkId = await web3.eth.net.getId();
    // Retrieve the Network configuration from truffle-config.js file
    const deployedNetwork = chargingOriginArtifact.networks[networkId];
    // Initializing the contract
    const ChargingOrigin = new web3.eth.Contract(
        chargingOriginArtifact.abi,
        deployedNetwork.address
    );

    return ChargingOrigin;
}

export default ContractInstance;