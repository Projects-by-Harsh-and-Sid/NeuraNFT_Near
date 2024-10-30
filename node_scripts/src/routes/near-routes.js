const express = require("express");
const { connect, keyStores, Near, Account, Contract } = require("near-api-js");
const path = require("path");
const router = express.Router();

const getConfig = require("../config/near.config");

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
let near;
let account;
let contract;

async function initNear() {
  near = await connect(config);
  account = await near.account(config.contractName);
  connection = await near.connection;
  contract = new Contract(connection, config.contractName, {
    viewMethods: [
      "getAllCollections",
      "getCollection",
      "getCollectionNFTCount",
      "getCollectionUniqueHolders",
      "getNFTInfo",
      "getMetadata",
      "getAllUsersAccessForNFT",
      "getAllAccessForUser",
      "getCollectionNFTs",
      "getCollectionFullInfo",
    ],
    changeMethods: [], // Add if you need mutation methods
  });
}

initNear().catch(console.error);

// Collection Routes
router.get("/get_all_collections", async (req, res) => {
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
      collectionaddress: `#${index + 1}`,
    }));
    res.json(formattedCollections);
  } catch (error) {
    console.error("Error getting collections:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

router.get("/get_collections_by_address", async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: "Address parameter is required" });
  }

  try {
    const allCollections = await contract.getAllCollections();
    const userCollections = allCollections.filter(
      (collection) =>
        collection.owner === address || collection.creator === address
    );
    res.json(userCollections);
  } catch (error) {
    console.error("Error getting collections by address:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

router.get("/get_collection_by_id", async (req, res) => {
  const { collection_id } = req.query;
  if (!collection_id) {
    return res
      .status(400)
      .json({ error: "Collection ID parameter is required" });
  }

  try {
    const collection = await contract.getCollection({
      collectionId: parseInt(collection_id),
    });
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const nftCount = await contract.getCollectionNFTCount({
      collectionId: parseInt(collection_id),
    });
    const uniqueHolders = await contract.getCollectionUniqueHolders({
      collectionId: parseInt(collection_id),
    });

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
      noOfServers: 5,
    };

    res.json(collectionDetails);
  } catch (error) {
    console.error("Error getting collection details:", error);
    res.status(500).json({ error: "Failed to fetch collection details" });
  }
});

// NFT Routes
router.get("/get_nfts_by_address", async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: "Address parameter is required" });
  }

  try {
    const userNFTs = await contract.getUserAccessibleNFTs({ user: address });
    const nftsWithDetails = await Promise.all(
      userNFTs.map(async ([collectionId, tokenId, accessLevel]) => {
        const nftInfo = await getNFTFullInfo(
          collectionId,
          tokenId,
          accessLevel
        );
        return nftInfo;
      })
    );
    res.json(nftsWithDetails);
  } catch (error) {
    console.error("Error getting NFTs by address:", error);
    res.status(500).json({ error: "Failed to fetch NFTs" });
  }
});

function fortmat_data_for_get_nfts_by_collection(
  nfts_list,
  collection_data,
  collectionid
) {
  // format of each nft
  //   {
  //     "baseModel": "Llama 3.1",
  //     "collectionId": 1,
  //     "creationDate": 1729638660,
  //     "creator": "0x43ADAc5516f8E2D3d2BD31276BeC343547ee6612",
  //     "data": "https://base.backend.neuranft.com/data",
  //     "description": "Cognitive Llama is an advanced AI-driven bot, utilizing the power of Llama 3.1 with multi-level reasoning and cognition. Part of the Neural Mint Hub collection.",
  //     "fineTuneData": "https://base.backend.neuranft.com/fineTuneData",
  //     "id": 1,
  //     "image": "https://base.backend.neuranft.com/image/temp11.jpg",
  //     "levelOfOwnership": 6,
  //     "name": "Cognitive Llama",
  //     "owner": "0x43ADAc5516f8E2D3d2BD31276BeC343547ee6612",
  //     "rag": "https://base.backend.neuranft.com/rag"
  // },

  const no_of_nft = nfts_list.length;

  let formattedNFTs = [];

  for (let i = 0; i < no_of_nft; i++) {
    const nft = nfts_list[i];
    const nft_data = nft.nftData;
    const nft_id = nft.tokenId;
    // const nft_info = nft_data.nftInfo;
    const nft_metadata = nft.metadata;



    const formattedNFT = {
      baseModel: nft_metadata.baseModel,
      collectionId: collectionid,
      creationDate: nft_data.creationDate,
      creator: nft_data.creator,
      data: nft_metadata.data,
      description: nft_metadata.description,
      // fineTuneData: nft_metadata.fineTuneData,
      id: nft_id,
      image: nft_metadata.image,
      levelOfOwnership: nft_data.levelOfOwnership,
      name: nft_data.name,
      owner: nft_data.owner,
      // rag: nft_metadata.rag
    };

    formattedNFTs.push(formattedNFT);
  }

  return formattedNFTs;
}



router.get("/get_nfts_by_collection", async (req, res) => {
  // const { collection_id } = req.query;
  // if (!collection_id) {
  //   return res
  //     .status(400)
  //     .json({ error: "Collection ID parameter is required" });
  // }

  // try {
  //   const collection_data = await contract.getCollectionNFTs({
  //     collectionId: parseInt(collection_id),
  //   });
  //   const formattedNFTs = await Promise.all(
  //     console.log(collection_data),
  //     console.log("nft data", collection_data.nfts.nftData),
  //     collection_data.nfts.map(async (tokenId) => {
  //       // collection_data.nfts is the lis to all the nfts for that collections
  //       return await getNFTData(parseInt(collection_id), tokenId);
  //     })
  //   );
  //   res.json(formattedNFTs);
  // } catch (error) {
  //   console.error("Error getting NFTs by collection:", error);
  //   res.status(500).json({ error: "Failed to fetch NFTs" });
  // }

  const { collection_id } = req.query;
  if (!collection_id) {
    return res
      .status(400)
      .json({ error: "Collection ID parameter is required" });
  }

  try {
    const collection_data = await contract.getCollectionNFTs({collectionId: parseInt(collection_id),});
    console.log("collection_data", collection_data);
    const formattedNFTs = fortmat_data_for_get_nfts_by_collection( collection_data.nfts, collection_data.collection, parseInt(collection_id));
    res.json(formattedNFTs);
  } 
  catch (error) {
    console.error("Error getting NFTs by collection:", error);
    res.status(500).json({ error: "Failed to fetch NFTs" });
  }



});





router.get("/get_nft_by_collectionid_nft_id", async (req, res) => {
  const { collection_id, nft_id } = req.query;
  if (!collection_id || !nft_id) {
    return res
      .status(400)
      .json({ error: "Both Collection ID and NFT ID parameters are required" });
  }

  try {
    const nftInfo = await getNFTFullInfo(
      parseInt(collection_id),
      parseInt(nft_id)
    );
    res.json(nftInfo);
  } catch (error) {
    console.error("Error getting NFT details:", error);
    res.status(500).json({ error: "Failed to fetch NFT details" });
  }
});




// Helper function to get complete NFT information
async function getNFTFullInfo(collectionId, tokenId, accessLevel = null) {
  const [nftInfo, metadata, collection] = await Promise.all([
    contract.getNFTInfo({ collectionId, tokenId }),
    contract.getMetadata({ collectionId, tokenId }),
    contract.getCollection({ collectionId }),
  ]);

  const accessUsers = await contract.getAllUsersAccessForNFT({
    collectionId,
    tokenId,
  });

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
    rag: metadata.rag || "",
    fineTuneData: metadata.fineTuneData || "",
    description: metadata.description,
    collection: collection.name,
    accessLevel: accessLevel,
    accessList: accessUsers.map(([user, level]) => ({
      user,
      accessLevel: level,
    })),
    tokenStandard: "NRC-101",
    tokenStandardFullform: "Neura Request for Comments 101",
    chain: "NEAR-Testnet",
    attributes: [
      { trait_type: "MMLU", value: "78.5" },
      { trait_type: "Context Window", value: collection.contextWindow },
      { trait_type: "Model", value: metadata.baseModel },
      { trait_type: "Total Access", value: accessUsers.length },
    ],
  };
}

module.exports = router;
