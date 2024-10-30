const express = require('express');
const { connect, keyStores, Near, Account, Contract } = require('near-api-js');
const path = require('path');
const router = express.Router();


const getConfig  = require('../config/near.config');

// NEAR connection configuration
// const config = {
//   networkId: 'testnet',
//   nodeUrl: 'https://rpc.testnet.near.org',
//   walletUrl: 'https://wallet.testnet.near.org',
//   helperUrl: 'https://helper.testnet.near.org',
//   explorerUrl: 'https://explorer.testnet.near.org',
//   keyStore: new keyStores.InMemoryKeyStore(),
//   contractName: 'neuranft_test1.testnet'  // Replace with your deployed contract name
// };

const config = getConfig("testnet");

// Initialize NEAR connection
let near ;
let account;
let contract;

async function initNear() {
  near = await connect(config);
  account = await near.account(config.contractName);
  connection = await near.connection;
  contract = new Contract(connection, config.contractName, {
    viewMethods: [
      'getAllCollections',
      'getCollection',
      'getCollectionNFTCount',
      'getCollectionUniqueHolders',
      'getNFTInfo',
      'getMetadata',
      'getAllUsersAccessForNFT',
      'getAllAccessForUser',
      'getCollectionNFTs',
      'getCollectionFullInfo'
    ],
    changeMethods: [] // Add if you need mutation methods
  });
}

initNear().catch(console.error);

// Collection Routes
router.get('/get_all_collections', async (req, res) => {
  try {
    const collections = await contract.getAllCollections();
    const formattedCollections = collections.map((collection, index) => ({
      id: index + 1,
      name: collection.name,
      contextWindow: collection.contextWindow,
      model: collection.baseModel,
      image: collection.image,
      description: collection.description,
      creator: collection.creator,
      date: collection.dateCreated,
      owner: collection.owner,
      collectionaddress: `#${index + 1}`
    }));
    res.json(formattedCollections);
  } catch (error) {
    console.error('Error getting collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

router.get('/get_collections_by_address', async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  try {
    const allCollections = await contract.getAllCollections();
    const userCollections = allCollections.filter(collection => 
      collection.owner === address || collection.creator === address
    );
    res.json(userCollections);
  } catch (error) {
    console.error('Error getting collections by address:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

router.get('/get_collection_by_id', async (req, res) => {
  const { collection_id } = req.query;
  if (!collection_id) {
    return res.status(400).json({ error: 'Collection ID parameter is required' });
  }

  try {
    const collection = await contract.getCollection({ collectionId: parseInt(collection_id) });
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const nftCount = await contract.getCollectionNFTCount({ collectionId: parseInt(collection_id) });
    const uniqueHolders = await contract.getCollectionUniqueHolders({ collectionId: parseInt(collection_id) });

    const collectionDetails = {
      id: parseInt(collection_id),
      name: collection.name,
      contextWindow: collection.contextWindow,
      baseModel: collection.baseModel,
      image: collection.image,
      description: collection.description,
      creator: collection.creator,
      dateCreated: collection.dateCreated,
      owner: collection.owner,
      collectionaddress: `#${collection_id}`,
      noOfNFTs: nftCount,
      uniqueHolders: uniqueHolders,
      model: collection.baseModel,
      noOfServers: 5
    };

    res.json(collectionDetails);
  } catch (error) {
    console.error('Error getting collection details:', error);
    res.status(500).json({ error: 'Failed to fetch collection details' });
  }
});

// NFT Routes
router.get('/get_nfts_by_address', async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  try {
    const userNFTs = await contract.getAllAccessForUser({ user: address });
    const nftsWithDetails = await Promise.all(
      userNFTs.map(async ([collectionId, tokenId, accessLevel]) => {
        const nftInfo = await getNFTFullInfo(collectionId, tokenId, accessLevel);
        return nftInfo;
      })
    );
    res.json(nftsWithDetails);
  } catch (error) {
    console.error('Error getting NFTs by address:', error);
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
});

router.get('/get_nfts_by_collection', async (req, res) => {
  const { collection_id } = req.query;
  if (!collection_id) {
    return res.status(400).json({ error: 'Collection ID parameter is required' });
  }

  try {
    const nfts = await contract.getCollectionNFTs({ collectionId: parseInt(collection_id) });
    const formattedNFTs = await Promise.all(
      nfts.map(async (nftId) => {
        return await getNFTFullInfo(parseInt(collection_id), nftId);
      })
    );
    res.json(formattedNFTs);
  } catch (error) {
    console.error('Error getting NFTs by collection:', error);
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
});

router.get('/get_nft_by_collectionid_nft_id', async (req, res) => {
  const { collection_id, nft_id } = req.query;
  if (!collection_id || !nft_id) {
    return res.status(400).json({ error: 'Both Collection ID and NFT ID parameters are required' });
  }

  try {
    const nftInfo = await getNFTFullInfo(parseInt(collection_id), parseInt(nft_id));
    res.json(nftInfo);
  } catch (error) {
    console.error('Error getting NFT details:', error);
    res.status(500).json({ error: 'Failed to fetch NFT details' });
  }
});

// Helper function to get complete NFT information
async function getNFTFullInfo(collectionId, tokenId, accessLevel = null) {
  const [nftInfo, metadata, collection] = await Promise.all([
    contract.getNFTInfo({ collectionId, tokenId }),
    contract.getMetadata({ collectionId, tokenId }),
    contract.getCollection({ collectionId })
  ]);

  const accessUsers = await contract.getAllUsersAccessForNFT({ collectionId, tokenId });

  return {
    id: tokenId,
    collectionId,
    tokenId,
    levelOfOwnership: nftInfo.levelOfOwnership,
    name: nftInfo.name,
    creator: nftInfo.creator,
    creationDate: nftInfo.creationDate,
    owner: nftInfo.owner,
    image: metadata.image,
    baseModel: metadata.baseModel,
    data: metadata.data,
    rag: metadata.rag || '',
    fineTuneData: metadata.fineTuneData || '',
    description: metadata.description,
    collection: collection.name,
    accessLevel: accessLevel,
    accessList: accessUsers.map(([user, level]) => ({
      user,
      accessLevel: level
    })),
    tokenStandard: "NRC-101",
    tokenStandardFullform: "Neura Request for Comments 101",
    chain: "NEAR-Testnet",
    attributes: [
      { trait_type: "MMLU", value: "78.5" },
      { trait_type: "Context Window", value: collection.contextWindow },
      { trait_type: "Model", value: metadata.baseModel },
      { trait_type: "Total Access", value: accessUsers.length }
    ]
  };
}

module.exports = router;