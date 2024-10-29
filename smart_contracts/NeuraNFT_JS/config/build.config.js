// config/build.config.js

module.exports = {
    contracts: {
        master: {
            name: 'MasterAccess',
            entry: './src/master/master_contract.js',
            output: './build/MasterAccess.wasm'
        },
        nft: {
            name: 'NFTContract',
            entry: './src/nft/nft_contract.js',
            output: './build/NFTContract.wasm'
        },
        collection: {
            name: 'Collection',
            entry: './src/collection/collection_contract.js',
            output: './build/Collection.wasm'
        }
    },
    
    // Common build options
    buildOptions: {
        debug: process.env.NODE_ENV !== 'production',
        optimize: process.env.NODE_ENV === 'production',
        noAssert: process.env.NODE_ENV === 'production'
    }
};