
- [NEAR Protocol JavaScript/TypeScript Smart Contract Development Guide](#near-protocol-javascripttypescript-smart-contract-development-guide)
  - [1. Project Structure Overview](#1-project-structure-overview)
    - [Key Directories and Files:](#key-directories-and-files)
  - [2. Building and Testing Configuration](#2-building-and-testing-configuration)
    - [Basic package.json Configuration](#basic-packagejson-configuration)
    - [Standard Build Scripts](#standard-build-scripts)
      - [Build Command Syntax Breakdown](#build-command-syntax-breakdown)
      - [Running Build and Test Commands](#running-build-and-test-commands)
  - [4. Advanced Script Configurations](#4-advanced-script-configurations)
    - [Multiple Contract Builds](#multiple-contract-builds)
    - [Environment-Specific Builds](#environment-specific-builds)
    - [Watch Mode for Development](#watch-mode-for-development)
  - [5. Common Script Patterns](#5-common-script-patterns)
    - [Clean Build](#clean-build)
    - [Build with Type Checking](#build-with-type-checking)
    - [Build with Multiple Environments](#build-with-multiple-environments)
  - [6. Build Script Best Practices](#6-build-script-best-practices)
  - [3. Smart Contract Syntax](#3-smart-contract-syntax)
    - [Basic Contract Structure](#basic-contract-structure)
    - [Storage Examples](#storage-examples)
  - [4. Testing Framework](#4-testing-framework)
    - [Basic Test File Structure](#basic-test-file-structure)
    - [Writing Tests](#writing-tests)
    - [Testing Helper Functions](#testing-helper-functions)
  - [5. Common Testing Patterns](#5-common-testing-patterns)
    - [Testing State Changes](#testing-state-changes)
    - [Testing Events](#testing-events)
    - [Testing Access Control](#testing-access-control)
  - [6. Best Practices](#6-best-practices)
  - [7. Setup VS Code Configuration (Optional)](#7-setup-vs-code-configuration-optional)



# NEAR Protocol JavaScript/TypeScript Smart Contract Development Guide

## 1. Project Structure Overview

A typical NEAR Protocol project structure follows this organization:

```
your_project_name/
├── package.json
├── README.md
├── src/
│   ├── contract1.js        # contract1
│   ├── contract2.js        # contract2
│   ├── contract3.ts        # contract3 in TS
│   └── utils/
│       ├── types.js        # Type definitions
│       └── helpers.js      # Helper functions
├── build/                  # Compiled contract files
├── tests/                  # Test files
|    ├── test.ava.js         
|    └── test1.ava.js          
└── package.json 
```

### Key Directories and Files:
- `src/`: Contains all source files for your smart contracts
- `build/`: Contains compiled WASM files
- `tests/`: Contains test files using AVA test framework
- `package.json`: Project configuration and scripts

## 2. Building and Testing Configuration


### Basic package.json Configuration

package.json is the main configuration file for a Node.js project. It includes project metadata, dependencies, and scripts.

```json
{
  "scripts": {
    "build": "near-sdk-js build src/index.js build/Contract.wasm",
    "test": "ava tests/test.ava.js -- ./build/Contract.wasm"
  },
  "dependencies": {
    "near-sdk-js": "latest",
    "ava": "latest"
  }
}
```

```bash
# Terminal Code
# Build the contract
npm run build

# Deploy to testnet
npm run deploy

# Run tests
npm test
```




### Standard Build Scripts

```json
{
  "scripts": {
    // Basic JavaScript build
    "build": "near-sdk-js build src/index.js build/Contract.wasm",
    
    // Basic test
    "test": "npm run build && ava tests/test.ava.js -- ./build/Contract.wasm",
    
    // TypeScript build
    "build:ts": "near-sdk-js build --generateABI src/contract.ts build/ContractTS.wasm",
    
    // TypeScript test
    "test:ts": "npm run build:ts && ava tests/test.ava.js -- build/ContractTS.wasm",
    
    // Optimized build
    "build:optimize": "near-sdk-js build --generateABI --optimizer src/optimized.js build/ContractOpt.wasm",
    
    // Test optimized build
    "test:optimize": "npm run build:optimize && ava tests/optimized.ava.js -- ./build/ContractOpt.wasm"
  }
}
```

#### Build Command Syntax Breakdown

Basic Build Command
```bash
near-sdk-js build <source-file> <output-file>
```
- `source-file`: Path to your contract's source file
- `output-file`: Where the compiled WASM will be saved

Example:
```bash
near-sdk-js build src/index.js build/Contract.wasm
```

Build Command Options

```bash
near-sdk-js build [options] <source-file> <output-file>
```

Common options:
- `--generateABI`: Generates an ABI file for the contract
- `--debug`: Includes debug information in the build
- `--optimizer`: Enables optimization for smaller, more efficient WASM
- `--noValidate`: Skips validation step (not recommended for production)

Example with options:
```bash
near-sdk-js build --generateABI --optimizer src/contract.js build/Contract.wasm
```

#### Running Build and Test Commands

 Basic Commands

```bash
# Run basic build
npm run build

# Run basic test
npm run test

# Run TypeScript build
npm run build:ts

# Run TypeScript test
npm run test:ts
```

Using Arguments with npm run

Format:
```bash
npm run <script-name> -- [arguments]
```

Examples:
```bash
# Run test with specific WASM file
npm run test -- ./build/CustomContract.wasm

# Run build with custom output path
npm run build -- --out ./custom/path/contract.wasm
```

## 4. Advanced Script Configurations

### Multiple Contract Builds
```json
{
  "scripts": {
    "build:all": "npm run build:contract1 && npm run build:contract2",
    "build:contract1": "near-sdk-js build src/contract1.js build/Contract1.wasm",
    "build:contract2": "near-sdk-js build src/contract2.js build/Contract2.wasm",
    "test:all": "npm run test:contract1 && npm run test:contract2",
    "test:contract1": "npm run build:contract1 && ava tests/contract1.ava.js -- ./build/Contract1.wasm",
    "test:contract2": "npm run build:contract2 && ava tests/contract2.ava.js -- ./build/Contract2.wasm"
  }
}
```

### Environment-Specific Builds
```json
{
  "scripts": {
    "build:dev": "near-sdk-js build --debug src/index.js build/Contract-dev.wasm",
    "build:prod": "near-sdk-js build --optimizer src/index.js build/Contract-prod.wasm",
    "test:dev": "npm run build:dev && ava tests/test.ava.js -- ./build/Contract-dev.wasm",
    "test:prod": "npm run build:prod && ava tests/test.ava.js -- ./build/Contract-prod.wasm"
  }
}
```

### Watch Mode for Development
```json
{
  "scripts": {
    "watch": "nodemon --watch src -e js,ts --exec 'npm run build'",
    "watch:test": "nodemon --watch src --watch tests -e js,ts --exec 'npm run test'"
  }
}
```

## 5. Common Script Patterns

### Clean Build
```json
{
  "scripts": {
    "clean": "rm -rf build/*",
    "build:clean": "npm run clean && npm run build"
  }
}
```

### Build with Type Checking
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build:safe": "npm run type-check && npm run build:ts"
  }
}
```

### Build with Multiple Environments
```json
{
  "scripts": {
    "build:testnet": "NEAR_ENV=testnet near-sdk-js build src/index.js build/Contract-testnet.wasm",
    "build:mainnet": "NEAR_ENV=mainnet near-sdk-js build src/index.js build/Contract-mainnet.wasm",
    "test:testnet": "NEAR_ENV=testnet npm run test",
    "test:mainnet": "NEAR_ENV=mainnet npm run test"
  }
}
```

## 6. Build Script Best Practices

1. **Use Descriptive Names**
   ```json
   {
     "scripts": {
       "build:contract": "near-sdk-js build src/contract.js build/Contract.wasm",
       "build:utils": "near-sdk-js build src/utils.js build/Utils.wasm"
     }
   }
   ```

2. **Include Clean Steps**
   ```json
   {
     "scripts": {
       "clean": "rm -rf build/*",
       "prebuild": "npm run clean",
       "build": "near-sdk-js build src/index.js build/Contract.wasm"
     }
   }
   ```

3. **Add Validation**
   ```json
   {
     "scripts": {
       "validate": "near-sdk-js validate",
       "build": "npm run validate && near-sdk-js build src/index.js build/Contract.wasm"
     }
   }
   ```

4. **Environment Variables**
   ```json
   {
     "scripts": {
       "build:dev": "NODE_ENV=development near-sdk-js build src/index.js build/Contract.wasm",
       "build:prod": "NODE_ENV=production near-sdk-js build src/index.js build/Contract.wasm"
     }
   }
   ```









## 3. Smart Contract Syntax

### Basic Contract Structure

```javascript
import { NearBindgen, near, call, view, initialize } from "near-sdk-js";

@NearBindgen({})
export class MyContract {
  constructor() {
    // Initialize contract state
  }

  @initialize({})
  init() {
    // Initialization logic
  }

  @view({})
  getState() {
    // View method
  }

  @call({})
  setState(newState) {
    // Call method
  }
}
```

### Storage Examples

```javascript
import { NearBindgen, near, UnorderedMap } from "near-sdk-js";

@NearBindgen({})
export class StorageExample {
  // Single value storage
  value = 0;
  
  // Map storage
  map = new UnorderedMap('m');
  
  @call({})
  setValue(value) {
    this.value = value;
    this.map.set('key', value);
  }
}
```

## 4. Testing Framework

### Basic Test File Structure

```javascript
import anyTest from 'ava';
import { Worker } from 'near-workspaces';

const test = anyTest;

test.beforeEach(async t => {
  // Setup test environment
  const worker = t.context.worker = await Worker.init();
  const root = worker.rootAccount;
  const contract = await root.createSubAccount('test-account');
  
  // Deploy contract
  await contract.deploy(process.argv[2]);
  await contract.call(contract, 'init', {});
  
  t.context.accounts = { root, contract };
});

test.afterEach.always(async t => {
  await t.context.worker.tearDown().catch(console.error);
});
```

### Writing Tests

```javascript
// View method test
test('test view method', async t => {
  const { contract } = t.context.accounts;
  const result = await contract.view('getState', {});
  t.is(result, expectedValue);
});

// Call method test
test('test call method', async t => {
  const { contract } = t.context.accounts;
  await contract.call('setState', { newState: 'value' });
  const result = await contract.view('getState', {});
  t.is(result, 'value');
});

// Access control test
test('test access control', async t => {
  const { root, contract } = t.context.accounts;
  const user = await root.createSubAccount('user');
  
  // Test unauthorized access
  await t.throwsAsync(async () => {
    await user.call(contract, 'adminOnly', {});
  }, { instanceOf: Error });
});
```

### Testing Helper Functions

```javascript
async function createTestUser(root, name, initialBalance) {
  return await root.createSubAccount(name, {
    initialBalance: initialBalance || '10N'
  });
}

async function assertThrows(t, promise, errorMsg) {
  await t.throwsAsync(async () => {
    await promise;
  }, { message: errorMsg });
}
```

## 5. Common Testing Patterns

### Testing State Changes

```javascript
test('state changes correctly', async t => {
  const { contract } = t.context.accounts;
  
  // Initial state
  const initial = await contract.view('getState', {});
  t.is(initial, 0);
  
  // Change state
  await contract.call('setState', { value: 42 });
  
  // Verify state change
  const final = await contract.view('getState', {});
  t.is(final, 42);
});
```

### Testing Events

```javascript
test('events are emitted correctly', async t => {
  const { contract } = t.context.accounts;
  
  const result = await contract.call('emitEvent', { 
    message: 'test' 
  });
  
  // Check logs
  t.deepEqual(result.logs, ['EVENT_EMITTED: test']);
});
```

### Testing Access Control

```javascript
test('access control works', async t => {
  const { root, contract } = t.context.accounts;
  const user = await createTestUser(root, 'user');
  
  // Test authorized access
  await contract.call('grantAccess', { account: user.accountId });
  const hasAccess = await contract.view('checkAccess', { 
    account: user.accountId 
  });
  t.true(hasAccess);
  
  // Test unauthorized access
  const unauthorized = await createTestUser(root, 'unauthorized');
  const noAccess = await contract.view('checkAccess', { 
    account: unauthorized.accountId 
  });
  t.false(noAccess);
});
```

## 6. Best Practices

1. **Test Organization**
   - Group related tests together
   - Use descriptive test names
   - Keep tests focused and atomic

2. **Error Handling**
   - Test both success and failure cases
   - Verify error messages
   - Test edge cases

3. **State Management**
   - Reset state between tests
   - Use beforeEach and afterEach hooks
   - Clean up resources properly

4. **Performance**
   - Minimize contract calls in tests
   - Use batch transactions when possible
   - Test with realistic data sizes






## 7. Setup VS Code Configuration (Optional)

Create .vscode/settings.json:
```json
{
  "editor.formatOnSave": true,
  "javascript.suggestionActions.enabled": false,
  "javascript.validate.enable": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

This completes the setup for a NEAR JavaScript development environment. You now have:
- A fully configured NEAR development environment
- Basic contract structure
- Testing setup
- Deployment scripts
- Development tools integration

You can start developing your smart contract by modifying the src/index.js file and adding additional functionality as needed.