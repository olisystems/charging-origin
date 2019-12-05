import web3 from './web3';
import sampleContractArtifact from "./contracts/SampleContract";

const ContractInstance = async () => {

    //This method find the network id to retrieve the configuration from truffle-config.js file
    const networkId = await web3.eth.net.getId();
    // Retrieve the Network configuration from truffle-config.js file
    const deployedNetwork = sampleContractArtifact.networks[networkId];
    // Initializing the contract
    const SampleContract = new web3.eth.Contract(
        sampleContractArtifact.abi,
        deployedNetwork.address
    );

    return SampleContract;
}

export default ContractInstance;