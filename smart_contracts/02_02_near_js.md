- [Setup NEAR Development Tools](#setup-near-development-tools)
  - [1. Install Node.js and npm](#1-install-nodejs-and-npm)
  - [2. Install NEAR CLI](#2-install-near-cli)
    - [Prerequisites](#prerequisites)
  - [3. Create a new NEAR project](#3-create-a-new-near-project)
    - [Project Structure](#project-structure)
  - [4. Project Configuration](#4-project-configuration)
  - [5. Create Basic Project Structure](#5-create-basic-project-structure)
  - [6. Initialize NEAR Development Environment](#6-initialize-near-development-environment)
  - [7. Setup Basic Contract Structure](#7-setup-basic-contract-structure)
  - [Additional Setup (Optional)](#additional-setup-optional)
    - [Contract Development Best Practices](#contract-development-best-practices)
      - [File Organization](#file-organization)
      - [Testing](#testing)
      - [Security Considerations](#security-considerations)
    - [Troubleshooting](#troubleshooting)
    - [Resources](#resources)
    - [Support](#support)


# Setup NEAR Development Tools

## 1. Install Node.js and npm
First, ensure you have Node.js (version 12 or higher) installed:
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# If you need to install Node.js, download from:
# https://nodejs.org/
```

## 2. Install NEAR CLI
```bash
# Install NEAR CLI globally
npm install -g near-cli

# Verify installation
near --version
```

### Prerequisites
- Node.js 12 or higher
- NEAR CLI (`npm install -g near-cli`)
- A NEAR account (create one at [wallet.near.org](https://wallet.near.org))

## 3. Create a new NEAR project

Option 1: Using create-near-app (Recommended for beginners)
```bash
# Install create-near-app globally
npm install -g create-near-app

# Create a new project
npx create-near-app 

- make the selections as needed
```

```bash
# Navigate to project directory
cd your_project_name

# Install dependencies
npm install
```

### Project Structure
After creating a new project, you'll have the following structure:
```
your_project_name/
├── package.json
├── README.md
├── src/
│   ├── index.js        # Main contract file
│   ├── metadata.js     # Metadata handling
│   ├── access.js       # Access control
│   └── utils/
│       ├── types.js    # Type definitions
│       └── helpers.js  # Helper functions
├── build/              # Compiled contract files
└── tests/              # Test files
```



Option 2: Manual Setup (For more control)
```bash
# Create project directory
mkdir your_project_name
cd your_project_name

# Initialize npm project
npm init -y

# Install necessary dependencies
npm install near-sdk-js near-api-js

# Install development dependencies
npm install --save-dev jest @babel/core @babel/preset-env
```

## 4. Project Configuration

Create a package.json with essential scripts:
```json
{
  "name": "your_project_name",
  "version": "1.0.0",
  "scripts": {
    "build": "near-sdk-js build src/index.js build/contract.wasm",
    "dev": "npm run build && npm run deploy",
    "deploy": "near deploy --accountId your-test-account.testnet --wasmFile build/contract.wasm",
    "test": "jest"
  },
  "dependencies": {
    "near-sdk-js": "latest",
    "near-api-js": "latest"
  },
  "devDependencies": {
    "jest": "^27.0.0",
    "@babel/core": "^7.0.0",
    "@babel/preset-env": "^7.0.0"
  }
}
```

## 5. Create Basic Project Structure
```bash
# Create project directories
mkdir -p src/utils tests build

# Create initial files
touch src/index.js
touch src/config.js
touch src/utils/helpers.js
touch tests/main.test.js
```

## 6. Initialize NEAR Development Environment
```bash
# Login to NEAR testnet
near login

# Set environment to testnet
export NEAR_ENV=testnet

# Or set to mainnet when ready
export NEAR_ENV=mainnet

# Create a test account if needed
near create-account your-test-account.testnet --masterAccount testnet
```

## 7. Setup Basic Contract Structure

Create src/index.js:
```javascript
import { NearBindgen, near, call, view, initialize } from "near-sdk-js";

@NearBindgen({})
class Contract {
    constructor() {
        this.message = "Hello NEAR";
    }

    @initialize({})
    init() {
        this.message = "Contract initialized";
    }

    @view({})
    get_greeting() {
        return this.message;
    }

    @call({})
    set_greeting({ message }) {
        this.message = message;
    }
}

export default Contract;
```



## Additional Setup (Optional)

Create .gitignore:
```
node_modules/
build/
.env
.DS_Store
coverage/
```

Create .env for environment variables:
```
NEAR_ENV=testnet
NEAR_ACCOUNT_ID=your-test-account.testnet
NEAR_PRIVATE_KEY=your-private-key
```




### Contract Development Best Practices

#### File Organization
- Keep contract logic modular and separated into different files
- Use clear naming conventions for methods and variables
- Implement proper access control mechanisms
- Handle errors gracefully with try/catch

#### Testing
- Write unit tests for all contract methods
- Test edge cases and error conditions
- Use NEAR's simulation testing capabilities
- Test on testnet before mainnet deployment

#### Security Considerations
- Implement proper access control
- Validate all inputs
- Handle edge cases properly
- Use safe math operations
- Follow NEAR security best practices



### Troubleshooting

Common issues and solutions:
1. **Gas errors**: Increase gas allocation for complex operations
2. **Account errors**: Ensure account exists and has sufficient balance
3. **Build errors**: Check Node.js version and dependencies
4. **Deployment failures**: Verify account permissions and contract size

### Resources

- [NEAR Documentation](https://docs.near.org)
- [NEAR JavaScript SDK](https://github.com/near/near-sdk-js)
- [NEAR Examples](https://examples.near.org)
- [NEAR API Reference](https://docs.near.org/api/rpc/introduction)

### Support

For additional support:
- Join NEAR Discord: [https://near.chat](https://near.chat)
- Visit NEAR Forum: [https://near.org/developers](https://near.org/developers)
- Stack Overflow: Tag questions with `nearprotocol`




