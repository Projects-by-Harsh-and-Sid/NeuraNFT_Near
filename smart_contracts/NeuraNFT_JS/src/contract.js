// src/contract.js

import { MasterAccessControl } from './master/master_contract';
// import { NFTContract } from './nft/nft_contract';
// import { CollectionContract } from './collection/collection_contract';

// Export all contracts
export {
    MasterAccessControl,
    // NFTContract,
    // CollectionContract
};

// Default export can be used to specify which contract to build
// This can be controlled via environment variable or build parameter
const contractMap = {
    'master': MasterAccessControl,
    // 'nft': NFTContract,
    // 'collection': CollectionContract
};

// Get contract name from environment variable or default to 'master'
const contractName = process.env.BUILD_CONTRACT || 'master';
export default contractMap[contractName];