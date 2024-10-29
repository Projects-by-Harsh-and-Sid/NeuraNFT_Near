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
    await root.call(contract, 'init', {});

    // Save state for test runs
    t.context.accounts = { root, contract };
});

test.afterEach.always(async t => {
    await t.context.worker.tearDown().catch((error) => {
        console.log('Failed to stop the Sandbox:', error);
    });
});

// Test if deployer has initial access
test('deployer has initial access', async t => {
    const { root, contract } = t.context.accounts;
    const hasAccess = await contract.view('hasAccess', {
        contractAddress: contract.accountId,
        caller: root.accountId
    });
    t.true(hasAccess);
});

// Test granting and checking access
test('can grant and check access', async t => {
    const { root, contract } = t.context.accounts;
    const testUser = await root.createSubAccount('test-user');
    
    // Initially should not have access
    let hasAccess = await contract.view('hasAccess', {
        contractAddress: contract.accountId,
        caller: testUser.accountId
    });
    t.false(hasAccess);

    // Grant access
    await root.call(contract, 'grantAccess', {
        contractAddress: contract.accountId,
        caller: testUser.accountId
    });

    // Should now have access
    hasAccess = await contract.view('hasAccess', {
        contractAddress: contract.accountId,
        caller: testUser.accountId
    });
    t.true(hasAccess);
});






// import anyTest from 'ava';
// import { Worker, NEAR } from 'near-workspaces';
// import { setDefaultResultOrder } from 'dns';
// import * as fs from 'fs';
// import * as path from 'path';
// setDefaultResultOrder('ipv4first');

// const test = anyTest;

// test.beforeEach(async t => {
//     // Create sandbox
//     const worker = t.context.worker = await Worker.init();
//     const root = worker.rootAccount;

//     // Read the WASM file
//     const wasmPath = path.resolve(process.argv[2]);
//     const wasm = fs.readFileSync(wasmPath);
    
//     // Create contract account
//     const contract = await root.createSubAccount('master-access');
    
//     // Deploy contract
//     await contract.deploy(wasm);

//     // Create test accounts
//     const alice = await root.createSubAccount('alice');
//     const bob = await root.createSubAccount('bob');
//     const testContract = await root.createSubAccount('test-contract');

//     // Initialize the contract
//     await contract.call(contract, 'init', {});

//     // Save state for test runs
//     t.context.accounts = { root, contract, alice, bob, testContract };
// });


// // import anyTest from 'ava';
// // import { Worker, NEAR } from 'near-workspaces';
// // import { setDefaultResultOrder } from 'dns';
// // setDefaultResultOrder('ipv4first');

// // const test = anyTest;

// // test.beforeEach(async t => {
// //     // Create sandbox
// //     const worker = t.context.worker = await Worker.init();

// //     // Deploy contract
// //     const root = worker.rootAccount;
// //     const contract = await root.createAndDeploy(
// //         'master-access',
// //         process.argv[2],
// //         { initialBalance: NEAR.parse('30 N').toString() }
// //     );

// //     // Create test accounts with initial balance
// //     const alice = await root.createAccount('alice', {
// //         initialBalance: NEAR.parse('30 N').toString()
// //     });
// //     const bob = await root.createAccount('bob', {
// //         initialBalance: NEAR.parse('30 N').toString()
// //     });
// //     const testContract = await root.createAccount('test-contract', {
// //         initialBalance: NEAR.parse('30 N').toString()
// //     });

// //     // Initialize the contract
// //     await contract.call(contract, 'init', {});

// //     // Save state for test runs
// //     t.context.accounts = { root, contract, alice, bob, testContract };
// // });


// test.afterEach.always(async (t) => {
//     await t.context.worker.tearDown().catch((error) => {
//         console.log('Failed to stop the Sandbox:', error);
//     });
// });

// // Test initial deployer access
// test('deployer has initial access', async (t) => {
//     const { root, contract } = t.context.accounts;
//     const hasAccess = await contract.view('hasAccess', {
//         contractAddress: contract.accountId,
//         caller: root.accountId
//     });
//     t.true(hasAccess);
// });

// // Test granting access
// test('can grant access to new user', async (t) => {
//     const { contract, alice, root } = t.context.accounts;
    
//     // Grant access to Alice
//     await root.call(contract, 'grantAccess', {
//         contractAddress: contract.accountId,
//         caller: alice.accountId
//     });

//     // Check if Alice has access
//     const hasAccess = await contract.view('hasAccess', {
//         contractAddress: contract.accountId,
//         caller: alice.accountId
//     });
//     t.true(hasAccess);
// });

// // Test revoking access
// test('can revoke access from user', async (t) => {
//     const { contract, alice, root } = t.context.accounts;
    
//     // First grant access
//     await root.call(contract, 'grantAccess', {
//         contractAddress: contract.accountId,
//         caller: alice.accountId
//     });

//     // Then revoke it
//     await root.call(contract, 'revokeAccess', {
//         contractAddress: contract.accountId,
//         caller: alice.accountId
//     });

//     // Check access is revoked
//     const hasAccess = await contract.view('hasAccess', {
//         contractAddress: contract.accountId,
//         caller: alice.accountId
//     });
//     t.false(hasAccess);
// });

// // Test unauthorized access
// test('unauthorized user cannot grant access', async (t) => {
//     const { contract, alice, bob } = t.context.accounts;
    
//     // Alice tries to grant access to Bob without having permission
//     await t.throwsAsync(async () => {
//         await alice.call(contract, 'grantAccess', {
//             contractAddress: contract.accountId,
//             caller: bob.accountId
//         });
//     }, { instanceOf: Error });
// });

// // Test self access granting
// test('contract can grant self access', async (t) => {
//     const { contract, testContract, alice } = t.context.accounts;
    
//     // Test contract grants self access to Alice
//     await testContract.call(contract, 'grantSelfAccess', {
//         addressToGrant: alice.accountId
//     });

//     // Verify Alice has access to test contract
//     const hasAccess = await contract.view('hasAccess', {
//         contractAddress: testContract.accountId,
//         caller: alice.accountId
//     });
//     t.true(hasAccess);
// });

// // Test self access check
// test('self check access returns correct status', async (t) => {
//     const { contract, testContract, alice } = t.context.accounts;
    
//     // Grant self access
//     await testContract.call(contract, 'grantSelfAccess', {
//         addressToGrant: alice.accountId
//     });

//     // Check access using selfCheckAccess
//     const hasAccess = await contract.view('selfCheckAccess', {
//         addressToCheck: alice.accountId
//     });
//     t.true(hasAccess);
// });

// // Test multiple access management
// test('can manage multiple access rights', async (t) => {
//     const { contract, alice, bob, testContract, root } = t.context.accounts;
    
//     // Grant different access rights
//     await root.call(contract, 'grantAccess', {
//         contractAddress: contract.accountId,
//         caller: alice.accountId
//     });

//     await testContract.call(contract, 'grantSelfAccess', {
//         addressToGrant: bob.accountId
//     });

//     // Verify different access rights
//     const aliceMainAccess = await contract.view('hasAccess', {
//         contractAddress: contract.accountId,
//         caller: alice.accountId
//     });
//     t.true(aliceMainAccess);

//     const bobTestAccess = await contract.view('hasAccess', {
//         contractAddress: testContract.accountId,
//         caller: bob.accountId
//     });
//     t.true(bobTestAccess);

//     const bobMainAccess = await contract.view('hasAccess', {
//         contractAddress: contract.accountId,
//         caller: bob.accountId
//     });
//     t.false(bobMainAccess);
// });