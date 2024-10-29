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

// Basic access test
test('deployer has initial access', async t => {
    const { root, contract } = t.context.accounts;
    const hasAccess = await contract.view('hasAccess', {
        contractAddress: contract.accountId,
        caller: root.accountId
    });
    t.true(hasAccess);
});

// Grant and check access
test('can grant and check access', async t => {
    const { root, contract } = t.context.accounts;
    const testUser = await root.createSubAccount('test-user');
    
    let hasAccess = await contract.view('hasAccess', {
        contractAddress: contract.accountId,
        caller: testUser.accountId
    });
    t.false(hasAccess);

    await root.call(contract, 'grantAccess', {
        contractAddress: contract.accountId,
        caller: testUser.accountId
    });

    hasAccess = await contract.view('hasAccess', {
        contractAddress: contract.accountId,
        caller: testUser.accountId
    });
    t.true(hasAccess);
});

// Test access revocation
test('can revoke access', async t => {
    const { root, contract } = t.context.accounts;
    const testUser = await root.createSubAccount('test-user');
    
    // Grant access
    await root.call(contract, 'grantAccess', {
        contractAddress: contract.accountId,
        caller: testUser.accountId
    });
    
    // Revoke access
    await root.call(contract, 'revokeAccess', {
        contractAddress: contract.accountId,
        caller: testUser.accountId
    });
    
    const hasAccess = await contract.view('hasAccess', {
        contractAddress: contract.accountId,
        caller: testUser.accountId
    });
    t.false(hasAccess);
});

// Test unauthorized access
test('unauthorized users cannot grant access', async t => {
    const { root, contract } = t.context.accounts;
    const unauthorizedUser = await root.createSubAccount('unauthorized');
    const targetUser = await root.createSubAccount('target');
    
    await t.throwsAsync(async () => {
        await unauthorizedUser.call(contract, 'grantAccess', {
            contractAddress: contract.accountId,
            caller: targetUser.accountId
        });
    }, { instanceOf: Error });
});

// Test self access management
test('contract can manage self access', async t => {
    const { root, contract } = t.context.accounts;
    const testContract = await root.createSubAccount('test-contract');
    const testUser = await root.createSubAccount('test-user');
    
    // Grant self access
    await testContract.call(contract, 'grantSelfAccess', {
        addressToGrant: testUser.accountId
    });
    
    const hasAccess = await contract.view('hasAccess', {
        contractAddress: testContract.accountId,
        caller: testUser.accountId
    });
    t.true(hasAccess);
});

// Complex test: Multiple users and contracts
test('can manage complex access patterns', async t => {
    const { root, contract } = t.context.accounts;
    
    // Create multiple users and contracts
    const user1 = await root.createSubAccount('user1');
    const user2 = await root.createSubAccount('user2');
    const contract1 = await root.createSubAccount('contract1');
    const contract2 = await root.createSubAccount('contract2');
    
    // Set up complex access patterns
    await root.call(contract, 'grantAccess', {
        contractAddress: contract1.accountId,
        caller: user1.accountId
    });
    
    await contract1.call(contract, 'grantSelfAccess', {
        addressToGrant: user2.accountId
    });
    
    // Verify complex access patterns
    const user1Contract1Access = await contract.view('hasAccess', {
        contractAddress: contract1.accountId,
        caller: user1.accountId
    });
    t.true(user1Contract1Access);
    
    const user2Contract1Access = await contract.view('hasAccess', {
        contractAddress: contract1.accountId,
        caller: user2.accountId
    });
    t.true(user2Contract1Access);
    
    const user1Contract2Access = await contract.view('hasAccess', {
        contractAddress: contract2.accountId,
        caller: user1.accountId
    });
    t.false(user1Contract2Access);
});

// // Test access hierarchy
// test('access hierarchy is properly enforced', async t => {
//     const { root, contract } = t.context.accounts;
//     const admin = await root.createSubAccount('admin');
//     const user = await root.createSubAccount('user');
    
//     // Grant admin access
//     await root.call(contract, 'grantAccess', {
//         contractAddress: contract.accountId,
//         caller: admin.accountId
//     });
    
//     // Admin grants access to user
//     await admin.call(contract, 'grantAccess', {
//         contractAddress: contract.accountId,
//         caller: user.accountId
//     });
    
//     // Verify user access
//     const hasAccess = await contract.view('hasAccess', {
//         contractAddress: contract.accountId,
//         caller: user.accountId
//     });
//     t.true(hasAccess);
    
//     // User cannot grant access to others
//     await t.throwsAsync(async () => {
//         await user.call(contract, 'grantAccess', {
//             contractAddress: contract.accountId,
//             caller: (await root.createSubAccount('another-user')).accountId
//         });
//     }, { instanceOf: Error });
// });

// Test access hierarchy
test('access hierarchy is properly enforced', async t => {

    t.timeout(60000); // 60 seconds timeout

    const { root, contract } = t.context.accounts;
    const admin = await root.createSubAccount('admin');
    const test_contract = await root.createSubAccount('test-contract');
    const user = await root.createSubAccount('user-129');
    const anotherUser = await root.createSubAccount('another-user-149');
    
    // Grant admin access
    await root.call(contract, 'grantAccess', {
        contractAddress: contract.accountId,
        caller: admin.accountId
    });
    
    // Admin grants access to user
    await admin.call(contract, 'grantAccess', {
        contractAddress: test_contract.accountId,
        caller: user.accountId
    });
    
    // Verify user access
    let hasAccess = await contract.view('hasAccess', {
        contractAddress: test_contract.accountId,
        caller: user.accountId
    });
    t.true(hasAccess);

    
    await t.throwsAsync(async () => {
        await user.call(contract, 'grantAccess', {
            contractAddress: test_contract.accountId,
            caller: anotherUser.accountId
        });
    }, { instanceOf: Error });


    // // User cannot grant access to others

    // let complete = true;
    // try {
        // await user.call(contract, 'grantAccess', {
        //     contractAddress: test_contract.accountId,
        //     caller: anotherUser.accountId
        // });
    // } catch (error) {
    //     complete = false;
    // }


    // // Verify user access
    // hasAccess = await contract.view('hasAccess', {
    //     contractAddress: contract.accountId,
    //     caller: anotherUser.accountId
    // });


    // t.false(complete);
    
});


// Test concurrent access operations
test('handles concurrent access operations correctly', async t => {
    const { root, contract } = t.context.accounts;
    const users = await Promise.all([
        root.createSubAccount('concurrent1'),
        root.createSubAccount('concurrent2'),
        root.createSubAccount('concurrent3')
    ]);
    
    // Perform concurrent operations
    await Promise.all(users.map(user => 
        root.call(contract, 'grantAccess', {
            contractAddress: contract.accountId,
            caller: user.accountId
        })
    ));
    
    // Verify all accesses
    for (const user of users) {
        const hasAccess = await contract.view('hasAccess', {
            contractAddress: contract.accountId,
            caller: user.accountId
        });
        t.true(hasAccess);
    }
});