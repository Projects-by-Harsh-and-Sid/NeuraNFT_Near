import anyTest from 'ava';
import { Worker } from 'near-workspaces';
import { setDefaultResultOrder } from 'dns';
import { NFTInfo } from 'src/models';
setDefaultResultOrder('ipv4first');

const test = anyTest;

test.beforeEach(async t => {
    // Create sandbox
    const worker = t.context.worker = await Worker.init();

    // Deploy contract
    const root = worker.rootAccount;
    const contract = await root.createSubAccount('nft-test');

    // Deploy the contract
    await contract.deploy(process.argv[2]);
    await contract.call(contract, 'init', {});

    // await root.call(contract, 'init', {});

    // Save state for test runs
    t.context.accounts = { root, contract };
});

test.afterEach.always(async t => {
    await t.context.worker.tearDown().catch((error) => {
        console.log('Failed to stop the Sandbox:', error);
    });
});

// Test collection creation and retrieval
test('can create and retrieve collection', async t => {
    const { root, contract } = t.context.accounts;
    
    const collectionData = {
        "name": "Test Collection",
        "contextWindow": 1024,
        "baseModel": "GPT-3",
        "image": "ipfs://test-image",
        "description": "Test collection description"
    };
    
    // Create collection
    const collectionId = await root.call(contract, 'createCollection', collectionData);
    t.truthy(collectionId);
    
    // Get collection data
    const collection = await contract.view('getCollection', { collectionId });
    t.is(collection.name, collectionData.name);
    t.is(collection.baseModel, collectionData.baseModel);
});

// Test NFT creation and metadata
test('can create NFT with metadata', async t => {
    const { root, contract } = t.context.accounts;
    
    // First create a collection
    const collectionId = await root.call(contract, 'createCollection', {
        name: "Test Collection",
        contextWindow: 1024,
        baseModel: "GPT-3",
        image: "ipfs://test-image",
        description: "Test collection description"
    });
    
    // Create NFT
    const nftData = {
        collectionId,
        name: "Test NFT",
        levelOfOwnership: 6 // AbsoluteOwnership
    };
    
    const tokenId = await root.call(contract, 'createNFT', nftData);
    t.truthy(tokenId);
    
    // Set metadata
    const metadata = {
        image: "ipfs://nft-image",
        baseModel: "GPT-3-fine-tuned",
        data: "ipfs://training-data",
        description: "Test NFT description"
    };
    
    await root.call(contract, 'setMetadata', {
        collectionId,
        tokenId,
        metadata
    });
    
    // Verify NFT and metadata
    const nftInfo = await contract.view('getNFTInfo', { collectionId, tokenId });
    t.is(nftInfo.name, nftData.name);
    t.is(nftInfo.owner, root.accountId);
    
    const storedMetadata = await contract.view('getMetadata', { collectionId, tokenId });
    t.deepEqual(storedMetadata, metadata);
});

// Test access control
test('can manage NFT access levels', async t => {
    const { root, contract } = t.context.accounts;
    const user = await root.createSubAccount('test-user');
    
    // Create collection and NFT
    const collectionId = await root.call(contract, 'createCollection', {
        name: "Test Collection",
        contextWindow: 1024,
        baseModel: "GPT-3",
        image: "ipfs://test-image",
        description: "Test description"
    });
    
    const tokenId = await root.call(contract, 'createNFT', {
        collectionId,
        name: "Test NFT",
        levelOfOwnership: 6
    });
    
    // Grant access to user
    await root.call(contract, 'setAccess', {
        collectionId,
        tokenId,
        user: user.accountId,
        level: 4 // ViewAndDownload
    });
    
    // Verify access level
    const accessLevel = await contract.view('getAccessLevel', {
        collectionId,
        tokenId,
        user: user.accountId
    });
    t.is(accessLevel, 4);
    
    // Get all user's access levels
    const userAccess = await contract.view('getAllUserAccessLevels', {
        user: user.accountId
    });
    t.is(userAccess.length, 1);
    t.is(userAccess[0].accessLevel, 4);
});

// Test NFT transfer
test('can transfer NFT and maintain access levels', async t => {
    const { root, contract } = t.context.accounts;
    const newOwner = await root.createSubAccount('new-owner');
    
    // Create collection and NFT
    const collectionId = await root.call(contract, 'createCollection', {
        name: "Test Collection",
        contextWindow: 1024,
        baseModel: "GPT-3",
        image: "ipfs://test-image",
        description: "Test description"
    });
    
    const tokenId = await root.call(contract, 'createNFT', {
        collectionId,
        name: "Test NFT",
        levelOfOwnership: 6
    });
    
    // Transfer NFT
    await root.call(contract, 'transferNFT', {
        collectionId,
        tokenId,
        receiverId: newOwner.accountId
    });
    
    // Verify ownership and access levels
    const nftInfo = await contract.view('getNFTInfo', { collectionId, tokenId });
    t.is(nftInfo.owner, newOwner.accountId);
    
    const oldOwnerAccess = await contract.view('getAccessLevel', {
        collectionId,
        tokenId,
        user: root.accountId
    });
    t.is(oldOwnerAccess, 0); // None
    
    const newOwnerAccess = await contract.view('getAccessLevel', {
        collectionId,
        tokenId,
        user: newOwner.accountId
    });
    t.is(newOwnerAccess, 6); // AbsoluteOwnership
});

// Test comprehensive data retrieval
test('can retrieve comprehensive NFT data', async t => {
    const { root, contract } = t.context.accounts;
    const user1 = await root.createSubAccount('user1');
    const user2 = await root.createSubAccount('user2');
    
    // Create collection
    const collectionId = await root.call(contract, 'createCollection', {
        name: "Test Collection",
        contextWindow: 1024,
        baseModel: "GPT-3",
        image: "ipfs://test-image",
        description: "Test description"
    });
    
    // Create multiple NFTs
    const tokenId1 = await root.call(contract, 'createNFT', {
        collectionId,
        name: "NFT 1",
        levelOfOwnership: 6
    });
    
    const tokenId2 = await root.call(contract, 'createNFT', {
        collectionId,
        name: "NFT 2",
        levelOfOwnership: 6
    });
    
    // Set metadata and access levels
    await root.call(contract, 'setMetadata', {
        collectionId,
        tokenId: tokenId1,
        metadata: {
            image: "ipfs://nft1-image",
            baseModel: "GPT-3-fine-tuned",
            data: "ipfs://data1",
            description: "NFT 1 description"
        }
    });
    
    await root.call(contract, 'setAccess', {
        collectionId,
        tokenId: tokenId1,
        user: user1.accountId,
        level: 4
    });
    
    await root.call(contract, 'setAccess', {
        collectionId,
        tokenId: tokenId1,
        user: user2.accountId,
        level: 2
    });
    
    // Test different data retrieval methods
    const collectionNFTs = await contract.view('getCollectionNFTs', { collectionId });
    t.is(collectionNFTs.nfts.length, 2);
    
    const nftFullData = await contract.view('getNFTFullData', { 
        collectionId, 
        tokenId: tokenId1 
    });
    t.is(nftFullData.nft.nftData.name, "NFT 1");
    t.truthy(nftFullData.nft.metadata);
    t.true(nftFullData.nft.accessData.users.users.length >= 2);
    
    const userNFTs = await contract.view('getUserNFTs', {
        user: root.accountId
    });
    t.true(userNFTs.length >= 2);
    
    const allCollections = await contract.view('getCollectionsFullInfo');
    t.true(allCollections.length >= 1);
    t.is(allCollections[0].statistics.totalNFTs, 2);
});

// Test NFT burning
test('can burn NFT and clean up associated data', async t => {
    const { root, contract } = t.context.accounts;
    
    // Create collection and NFT
    const collectionId = await root.call(contract, 'createCollection', {
        name: "Test Collection",
        contextWindow: 1024,
        baseModel: "GPT-3",
        image: "ipfs://test-image",
        description: "Test description"
    });
    
    const tokenId = await root.call(contract, 'createNFT', {
        collectionId,
        name: "Test NFT",
        levelOfOwnership: 6
    });
    
    // Set metadata
    await root.call(contract, 'setMetadata', {
        collectionId,
        tokenId,
        metadata: {
            image: "ipfs://nft-image",
            baseModel: "GPT-3-fine-tuned",
            data: "ipfs://data",
            description: "Test description"
        }
    });
    
    // Burn NFT
    await root.call(contract, 'burnNFT', {
        collectionId,
        tokenId
    });
    

    NFTInfo = await contract.view('getNFTInfo', { collectionId, tokenId });
    // NFTInfo should be undefined or null
    t.true(!NFTInfo);


    // Verify NFT is gone
    // await t.throwsAsync(async () => {
    //     await contract.view('getNFTInfo', { collectionId, tokenId });
    // });
    
    // Verify metadata is gone
    await t.throwsAsync(async () => {
        await contract.view('getMetadata', { collectionId, tokenId });
    });
    
    // Verify NFT doesn't appear in collection
    const collectionNFTs = await contract.view('getCollectionNFTs', { collectionId });
    t.is(collectionNFTs.nfts.length, 0);
});