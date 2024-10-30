const { keyStores } = require('near-api-js');

const getConfig = (env) => {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.near.org',
        keyStore: new keyStores.InMemoryKeyStore(),
        contractName: process.env.NEAR_CONTRACT_NAME,
        headers: {}
      };
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        keyStore: new keyStores.InMemoryKeyStore(),
        contractName: process.env.NEAR_CONTRACT_NAME,
        headers: {}
      };
    default:
      throw Error(`Invalid environment: ${env}`);
  }
};

module.exports = getConfig;