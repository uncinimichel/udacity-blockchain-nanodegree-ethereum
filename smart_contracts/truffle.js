var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'trick core barely fold sample icon display hollow smoke task emotion pepper';

module.exports = {
  networks: { 
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: "*",
      gas:4600000
    }, 
    rinkeby: {
      provider: function() { 
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/9064dd50a1d749b9a40b1e9261550118') 
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    }
  }
};