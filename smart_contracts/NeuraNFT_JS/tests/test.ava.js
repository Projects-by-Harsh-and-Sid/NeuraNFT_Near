import anyTest from 'ava';
import { Worker } from 'near-workspaces';
import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');

/**
 * @typedef {import('near-workspaces').NearAccount} NearAccount
 * @type {import('ava').TestFn<{worker: Worker, accounts: Record<string, NearAccount>}>}
 */
const test = anyTest;

test.beforeEach(async t => {
    // Create sandbox
    const worker = t.context.worker = await Worker.init();

    // Deploy contract
    const root = worker.rootAccount;
    const contract = await root.createSubAccount('test-account');

    // Deploy the contract
    await contract.deploy(
        process.argv[2],
    );

    // Initialize the contract
    await contract.call(contract, 'init', {});

    // Save state for test runs
    t.context.accounts = { root, contract };
});

test.afterEach.always(async t => {
    await t.context.worker.tearDown().catch((error) => {
        console.log('Failed to stop the Sandbox:', error);
    });
});

// Test contract deployment and initialization
test('contract deploys and initializes successfully', async t => {
    const { contract } = t.context.accounts;
    const version = await contract.view('version');
    t.is(version, '1.0.0');
});

// Test collection creation
test('can create a collection', async t => {
    const { root, contract } = t.context.accounts;
    
    const collectionData = {
        name: "Test Collection",
        context_window: 1024,
        base_model: "GPT-3",
        image: "https://example.com/image.jpg",
        description: "Test Collection Description"
    };

    const collectionId = await root.call(contract, 'create_collection', collectionData);
    
    const collection = await contract.view('get_collection', { collection_id: collectionId });
    t.is(collection.name, collectionData.name);
});

// test('can create a collection', async t => {
//     const { root, contract } = t.context.accounts;
    
//     const collectionData = {
//         name: "Test Collection",
//         context_window: 1024,
//         base_model: "GPT-3",
//         image: "https://example.com/image.jpg",
//         description: "Test Collection Description"
//     };

//     try {
//         const collectionId = await root.call(contract, 'create_collection', collectionData);
//         const collection = await contract.view('get_collection', { collection_id: collectionId });
//         t.is(collection.name, collectionData.name);
//     } catch (error) {
//         // Parse the error message from the JSON structure
//         let errorMessage;
//         try {
//             const errorJson = JSON.parse(error.message);
//             const failure = errorJson.result.status.Failure;
            
//             if (failure?.ActionError?.kind?.FunctionCallError?.ExecutionError) {
//                 errorMessage = failure.ActionError.kind.FunctionCallError.ExecutionError;
//             } else {
//                 errorMessage = JSON.stringify(errorJson.result.status, null, 2);
//             }
//         } catch (parseError) {
//             errorMessage = error.message;
//         }
        
//         console.error('Error creating collection:');
//         console.error(errorMessage);
        
//         // Re-throw the error with the cleaned up message
//         throw new Error(`Failed to create collection: ${errorMessage}`);
//     }
// });


// // Test NFT creation
// test('can create and retrieve NFT', async t => {
//     const { root, contract } = t.context.accounts;
    
//     // First create a collection
//     const collectionId = await root.call(contract, 'create_collection', {
//         name: "Test Collection",
//         context_window: 1024,
//         base_model: "GPT-3",
//         image: "https://example.com/image.jpg",
//         description: "Test Collection Description"
//     });

//     // Create NFT
//     const nftData = {
//         collection_id: collectionId,
//         name: "Test NFT",
//         level_of_ownership: 6,
//         metadata: {
//             title: "Test NFT",
//             description: "Test NFT Description",
//             media: "https://example.com/nft.jpg"
//         }
//     };

//     const tokenId = await root.call(contract, 'create_nft', nftData);
    
//     // Retrieve NFT
//     const nft = await contract.view('get_nft_info', {
//         collection_id: collectionId,
//         token_id: tokenId
//     });

//     t.is(nft.name, nftData.name);
// });

// // Test NFT metadata operations
// test('can set and get NFT metadata', async t => {
//     const { root, contract } = t.context.accounts;
    
//     // Create collection and NFT first
//     const collectionId = await root.call(contract, 'create_collection', {
//         name: "Test Collection",
//         context_window: 1024,
//         base_model: "GPT-3",
//         image: "https://example.com/image.jpg",
//         description: "Test Collection Description"
//     });

//     const tokenId = await root.call(contract, 'create_nft', {
//         collection_id: collectionId,
//         name: "Test NFT",
//         level_of_ownership: 6
//     });

//     // Set metadata
//     const metadata = {
//         title: "Updated NFT",
//         description: "Updated Description",
//         media: "https://example.com/updated.jpg",
//         base_model: "GPT-4",
//         data: "https://example.com/data",
//         rag: "https://example.com/rag",
//         fineTuneData: "https://example.com/fine-tune"
//     };

//     await root.call(contract, 'set_metadata', {
//         collection_id: collectionId,
//         token_id: tokenId,
//         metadata: metadata
//     });

//     // Get metadata
//     const retrievedMetadata = await contract.view('get_metadata', {
//         collection_id: collectionId,
//         token_id: tokenId
//     });

//     t.is(retrievedMetadata.title, metadata.title);
// });

// // Test access control
// test('can set and check access levels', async t => {
//     const { root, contract } = t.context.accounts;
//     const testUser = await root.createSubAccount('test-user');
    
//     // Create collection and NFT
//     const collectionId = await root.call(contract, 'create_collection', {
//         name: "Test Collection",
//         context_window: 1024,
//         base_model: "GPT-3",
//         image: "https://example.com/image.jpg",
//         description: "Test Collection Description"
//     });

//     const tokenId = await root.call(contract, 'create_nft', {
//         collection_id: collectionId,
//         name: "Test NFT",
//         level_of_ownership: 6
//     });

//     // Grant access
//     await root.call(contract, 'grant_access', {
//         collection_id: collectionId,
//         token_id: tokenId,
//         account_id: testUser.accountId,
//         access_level: 4 // ViewAndDownload level
//     });

//     // Check access level
//     const accessLevel = await contract.view('get_access_level', {
//         collection_id: collectionId,
//         token_id: tokenId,
//         account_id: testUser.accountId
//     });

//     t.is(accessLevel, 4);
// });

// // Test complete NFT workflow
// test('complete NFT workflow', async t => {
//     const { root, contract } = t.context.accounts;
//     const user = await root.createSubAccount('user');

//     // 1. Create collection
//     const collectionId = await root.call(contract, 'create_collection', {
//         name: "Test Collection",
//         context_window: 1024,
//         base_model: "GPT-3",
//         image: "https://example.com/image.jpg",
//         description: "Test Collection Description"
//     });

//     // 2. Create NFT
//     const tokenId = await root.call(contract, 'create_nft', {
//         collection_id: collectionId,
//         name: "Test NFT",
//         level_of_ownership: 6,
//         metadata: {
//             title: "Test NFT",
//             description: "Test NFT Description",
//             media: "https://example.com/nft.jpg"
//         }
//     });

//     // 3. Set access for user
//     await root.call(contract, 'grant_access', {
//         collection_id: collectionId,
//         token_id: tokenId,
//         account_id: user.accountId,
//         access_level: 4
//     });

//     // 4. Verify everything
//     const nft = await contract.view('get_nft_info', {
//         collection_id: collectionId,
//         token_id: tokenId
//     });
//     const metadata = await contract.view('get_metadata', {
//         collection_id: collectionId,
//         token_id: tokenId
//     });
//     const accessLevel = await contract.view('get_access_level', {
//         collection_id: collectionId,
//         token_id: tokenId,
//         account_id: user.accountId
//     });

//     t.is(nft.name, "Test NFT");
//     t.is(metadata.title, "Test NFT");
//     t.is(accessLevel, 4);
// });