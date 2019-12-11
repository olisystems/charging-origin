import web3 from './web3';

import testArtifact from "./contracts/Test";

const TestInstance = async () => {

    //This method find the network id to retrieve the configuration from truffle-config.js file
    const networkId = await web3.eth.net.getId();
    // Retrieve the Network configuration from truffle-config.js file
    const deployedNetwork = testArtifact.networks[networkId];
    // Initializing the contract
    const Test = new web3.eth.Contract(
        testArtifact.abi,
        deployedNetwork.address
    );

    return Test;
}

export default TestInstance;