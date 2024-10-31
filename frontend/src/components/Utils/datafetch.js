import endpoints from '../../endpoints.json';
import collectionsData from '../HomePage/collections.json';
import nftsData from '../HomePage/nfts.json';

// export const fetchAllCollections = async() => {

//   console.log(collectionsData.collections);
//   return collectionsData.collections;



// };

// export const fetchAllNFTs = async() => {
//   return nftsData.nfts;
// };



import axios from 'axios';

// const baseURL = endpoints.BACKEND_URL;
const baseURL = endpoints.NEAR_BACKEND_URL;

export const fetchAllCollections = async () => {
  try {
    // const response = await axios.get(`${baseURL}/api/get_all_collections`);
    const response = await axios.get(`${baseURL}/api/get_all_collections`);

    //   console.log("collection data expected", collectionsData.collections);
    // console.log("Collection data.collections: ",response.data.collections);
    console.log("Collection data: ",response);
    return response.data;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

export const fetchAllNFTs = async () => { // not working
  try {
    // const response = await axios.get(`${baseURL}/get_all_nfts`);
    const response = await axios.get(`${baseURL}/get_all_nfts`);

    console.log("NFT data: ", response.data);
    return response.data.nfts;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw error;
  }
};


export const getCollectionById = async (collectionId) => {
  try {
    const url = `${baseURL}/api/get_collection_by_id?collection_id=${collectionId}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching collection by ID:', error);
    throw error;
  }
};

export const getParticularNFT = async (nftId, collectionAddress) => {
  try {
    // const response = await axios.get(`${baseURL}/get_particular_nft`, {
    //   params: { 
    //     nft_id: nftId,
    //     collection_address: collectionAddress
    //   }
    // });
    const url = `${baseURL}/api/get_particular_nft?nft_id=${nftId}&collection_address=${collectionAddress}`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching particular NFT:', error);
    throw error;
  }
};

export const getNFTsByCollection = async (id) => { // not working
  try {
    const url = `${baseURL}/api/get_nfts_by_collection?collection_id=${id}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching NFTs by collection:', error);
    throw error;
  }
};


export const getCollectionsByAddress = async (address) => {
  try {

    const url = `${baseURL}/api/get_collections_by_address?address=${address}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching collections by address:', error);
    throw error;
  }
};

export const getNFTsByAddress = async (address) => {
  try {
    const response = await axios.get(`${baseURL}/api/get_nfts_by_address`, {
      params: { address }
    });
    // const url = `/api/get_nfts_by_address?address=${address}`;

    // const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching NFTs by address:', error);
    throw error;
  }
};

export const getAllDataforAddress = async (address) => {
  try {


    const myCollections   = await getCollectionsByAddress(address);

    console.log("collelctions",myCollections);

    
    const nfts            = await getNFTsByAddress(address);


    // console.log('All data for address:', { myCollections, nfts });

    return { myCollections, nfts };

  } catch (error) {

    console.error('Error fetching all data for address:', error);

    throw error;

  }

};


export const getCompoundedNFTData = async (collectionid,nftid) => {
  try {
    const response = await axios.get(`${baseURL}/api/get_nft_by_collectionid_nft_id`, {
      params: { "collection_id": collectionid, "nft_id": nftid }
    });
    // const url = `/api/get_nft_by_collectionid_nft_id?collection_id=${collectionid}&nft_id=${nftid}`;

    // const response = await axios.get(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching compounded NFT data:', error);
    throw error;
  }
}






export const fetchMyData = (address) => {


  const myCollections = collectionsData.collections.filter(
    collection => collection.creator === address
  );

  const myNFTs = nftsData.nfts.filter(
    nft => nft.owner === address
  );

  console.log("myNFTs",myNFTs);

  return { myCollections, myNFTs };
};



// export const collection_nft = (collection_address) => {
//     // const myCollections = collectionsData.collections.filter(
//     //     collection => collection.creator === collection_address
//     // );
//     const myNFTs = nftsData.nfts.filter(
//         nft => nft.collectionaddress === collection_address
//     );
    
//     return { myNFTs };
//     };
// export const collection_from_id = (collection_id) => {
//     const myCollections = collectionsData.collections.filter(
//         collection => collection.id === collection_id
//     );
//     return { myCollections };
//     }

    // export const particular_nft = (nftid,collection_address) => {
    //     const myNFTs = nftsData.nfts.filter(
    //         nft => nft.id === nftid && nft.collectionaddress === collection_address
    //     );
        
    //     return { myNFTs };
    //     };



// datafetch.js
export const fetchData = async (type, param1 = null, param2 = null) => {
  switch (type) {
    case 'allCollections':
      return await fetchAllCollections();
    case 'allNFTs':
      return await fetchAllNFTs();
    case 'myData':
      if (!param1) throw new Error('Address is required for myData fetch');
      return getAllDataforAddress(param1);
    case 'collection_nft':
      if (!param1) throw new Error('Collection address is required for collection_nft fetch');
      return getNFTsByCollection(param1);
    case 'collection_from_id':
      if (!param1) throw new Error('Collection ID is required for collection_from_id fetch');
      // return collection_from_id(param1);
      return getCollectionById(param1);

    case 'particular_nft':
      if (!param1 || !param2) throw new Error('NFT ID and Collection Address are required for particular_nft fetch');
      return getParticularNFT(param1, param2);
    case 'compounded_nft':
      if (!param1 || !param2) throw new Error('Collection ID and NFT ID are required for compounded_nft fetch');
      return getCompoundedNFTData(param1, param2);
    default:
      throw new Error('Invalid fetch type');
  
  }
};
