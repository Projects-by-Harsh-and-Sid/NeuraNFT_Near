import { connect, keyStores, WalletConnection, Contract, utils } from 'near-api-js';
// import { useAppContext } from '../../WalletContext'


// Function to sign JSON data
// async function signJsonData(jsonData) {
//     const web3 = getWeb3();
//     const accounts = await web3.eth.getAccounts();
    
//     if (accounts.length === 0) {
//       throw new Error('No account found. Please connect your wallet.');
//     }
  
//     const messageToSign = JSON.stringify(jsonData);
  
//     try {
//       const signature = await web3.eth.personal.sign(messageToSign, accounts[0]);
//       console.log("Signature:", signature);
  
//       const signerAddress = web3.eth.accounts.recover(messageToSign, signature);
//       console.log("Signer Address:", signerAddress);
  
//       return { signature, signerAddress };
//     } catch (error) {
//       console.error("Error signing or verifying message:", error);
//       alert('Error signing data: ' + error.message);
//       return null;
//     }
//   }

function getContract(account, contractId, viewMethods, changeMethods) {
  return new Contract(account, contractId, {
    viewMethods: viewMethods || [],
    changeMethods: changeMethods || [],
  });
}

async function createCollection( walletConnection,name, contextWindow, baseModel, image, description) {
  // const { walletConnection, nearState } = useAppContext();

  // if (!nearState.loggedIn) {
  //   throw new Error('Wallet not connected');
  // }

  const account = walletConnection.account();
  const contractId = 'neuranft_test1.testnet'; // Replace with your contract's account ID

  const contract = getContract(account, contractId, [], ['createCollection']);

  try {
    const result = await contract.createCollection(
      {
        name,
        contextWindow,
        baseModel,
        image,
        description,
      },
      '300000000000000', // Attached gas
      '0' // Attached deposit (if any)
    );

    console.log('Collection created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
}


async function createNFT( walletConnection,collectionId, name, levelOfOwnership) {
  // const { walletConnection, nearState } = useAppContext();

  // if (!nearState.loggedIn) {
  //   throw new Error('Wallet not connected');
  // }

  const account = walletConnection.account();
  const contractId = 'neuranft_test1.testnet'; // Replace with your contract's account ID

  const contract = getContract(account, contractId, [], ['createNFT']);

  try {
    const result = await contract.createNFT(
      {
        collectionId,
        name,
        levelOfOwnership,
      },
      '300000000000000', // Attached gas
      '0' // Attached deposit (if any)
    );

    console.log('NFT created successfully:', result);
    // Assuming the contract method returns the new tokenId
    return result;
  } catch (error) {
    console.error('Error creating NFT:', error);
    throw error;
  }
}





async function createNFTMetadata( walletConnection,collectionId, tokenId, metadata) {
  // const { walletConnection, nearState } = useAppContext();

  // if (!nearState.loggedIn) {
  //   throw new Error('Wallet not connected');
  // }

  const account = walletConnection.account();
  const contractId = 'neuranft_test1.testnet'; // Replace with your contract's account ID

  const contract = getContract(account, contractId, [], ['setMetadata']);

  try {
    const result = await contract.setMetadata(
      {
        collectionId,
        tokenId,
        metadata,
      },
      '300000000000000', // Attached gas
      '0' // Attached deposit (if any)
    );

    console.log('Metadata set successfully:', result);
    return result;
  } catch (error) {
    console.error('Error setting metadata:', error);
    throw error;
  }
}


// async function extractNFTIdFromTransaction(transactionHash) {
//     const web3 = getWeb3();
//     const maxAttempts = 20;
//     const delay = 5000;

//     console.log('Transaction Hash:', transactionHash);
  
//     if (!transactionHash || typeof transactionHash !== 'string' || !transactionHash.startsWith('0x') || transactionHash.length !== 66) {
//       throw new Error('Invalid transaction hash format');
//     }
  
//     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//       try {
//         const receipt = await web3.eth.getTransactionReceipt(transactionHash);
//         console.log(`Attempt ${attempt}: Retrieved receipt:`, receipt);
  
//         if (receipt && receipt.logs) {
//           for (const log of receipt.logs) {
//             // if (log.topics[0] === sha3('NFTCreated(uint256,uint256,string,address)')) {
//             if (log.topics[0] === web3.utils.sha3('NFTCreated(uint256,uint256,string,address)')) {

//               const nftId = web3.utils.hexToNumber(log.topics[2]);
//               console.log('Minted NFT ID:', nftId);
//               return nftId;
//             }
//           }
//           console.log('NFTCreated event not found in logs.');
//         } else {
//           console.log('Transaction receipt not available yet.');
//         }
//       } catch (error) {
//         console.error(`Error on attempt ${attempt}:`, error);
//         if (error.message.includes('Web3ValidatorError')) {
//           throw new Error('Invalid transaction hash: ' + error.message);
//         }
//       }
  
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
  
//     throw new Error('Failed to retrieve NFT ID after multiple attempts');
//   }


async function extractNFTIdFromTransaction( walletConnection,transactionHash) {
  // const { walletConnection } = useAppContext();

  const account = walletConnection.account();
  const accountId = account.accountId;

  try {
    const txStatus = await account.connection.provider.txStatus(transactionHash, accountId);

    console.log('Transaction status:', txStatus);

    if (txStatus.status && txStatus.status.SuccessValue) {
      const successValue = txStatus.status.SuccessValue;
      const decodedValue = Buffer.from(successValue, 'base64').toString('utf-8');
      console.log('Decoded return value:', decodedValue);

      return decodedValue;
    } else {
      console.log('No SuccessValue in transaction status');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving transaction status:', error);
    throw error;
  }
}

  


  async function UpdateAcceess( walletConnection,collectionId, tokenId, user, accessLevel) {
    // const { walletConnection, nearState } = useAppContext();
  
    // if (!nearState.loggedIn) {
    //   throw new Error('Wallet not connected');
    // }
  
    const account = walletConnection.account();
    const contractId = 'neuranft_test1.testnet'; // Replace with your contract's account ID
  
    const contract = getContract(account, contractId, [], ['setAccess']);
  
    try {
      const result = await contract.setAccess(
        {
          collectionId,
          tokenId,
          user,
          level: accessLevel,
        },
        '300000000000000', // Attached gas
        '0' // Attached deposit (if any)
      );
  
      console.log('Access updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating access:', error);
      throw error;
    }
  }
  

  
  // export const createCollectionWithChainCheck = withChainCheck(createCollection);
  // export const createNFTWithChainCheck = withChainCheck(createNFT);
  // export const createNFTMetadataWithChainCheck = withChainCheck(createNFTMetadata);
  // export const UpdateAcceessWithChainCheck = withChainCheck(UpdateAcceess);


export {createCollection, createNFT, createNFTMetadata, extractNFTIdFromTransaction, UpdateAcceess };

