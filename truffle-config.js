
const HDWalletProvider = require('truffle-hdwallet-provider');
const NonceTrackerSubprovider = require("web3-provider-engine/subproviders/nonce-tracker")
const fs = require('fs');
const path = require('path');
const MNEMONIC = fs.readFileSync(".mnemonic").toString().trim();
var ENDPOINT = "https://volta-rpc.energyweb.org";
module.exports = {

  // custom path for smart contracts metadata
  contracts_build_directory: path.join(__dirname, 'app/src/assets/js/contracts'),

  networks: {

    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      websockets: true
    },

    volta: {
      provider: function () {
        const wallet = new HDWalletProvider(MNEMONIC, ENDPOINT);
        const nonceTracker = new NonceTrackerSubprovider()
        wallet.engine._providers.unshift(nonceTracker)
        nonceTracker.setEngine(wallet.engine)
        return wallet
      },
      network_id: 73799
    }

  },

  compilers: {
    solc: {
      // version: "0.5.1",
    }
  }
}