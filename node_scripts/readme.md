# NEAR Backend Server Documentation

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Configuration](#configuration)
4. [Running the Server](#running-the-server)
5. [API Documentation](#api-documentation)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the server, ensure you have the following installed:
- Node.js (v14 or later)
- npm (v6 or later)
- Git
- A NEAR account (testnet or mainnet)
- NEAR CLI (optional but recommended)

## Project Setup

1. Create a new directory and initialize the project:
```bash
mkdir near-backend
cd near-backend
npm init -y
```

2. Install required dependencies:
```bash
npm install express near-api-js dotenv cors helmet
```

3. Create the project structure:
```bash
mkdir src
mkdir src/routes
mkdir src/config
mkdir src/utils
touch src/index.js
touch .env
touch .gitignore
```

4. Create the following files with their respective content:

`.gitignore`:
```
node_modules
.env
.DS_Store
```

`.env`:
```
PORT=3000
NEAR_NETWORK=testnet
NEAR_CONTRACT_NAME=your-contract-name.testnet
NODE_ENV=development
```

`src/config/near.config.js`:
```javascript
const { keyStores } = require('near-api-js');

const getConfig = (env) => {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.near.org',
        keyStore: new keyStores.InMemoryKeyStore(),
        contractName: process.env.NEAR_CONTRACT_NAME,
        headers: {}
      };
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        keyStore: new keyStores.InMemoryKeyStore(),
        contractName: process.env.NEAR_CONTRACT_NAME,
        headers: {}
      };
    default:
      throw Error(`Invalid environment: ${env}`);
  }
};

module.exports = getConfig;
```

`src/index.js`:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const nearRoutes = require('./routes/near-routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', nearRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
```

5. Copy the NEAR routes implementation (from previous response) into `src/routes/near-routes.js`.

## Configuration

1. Update the `.env` file with your specific configuration:
```env
PORT=3000
NEAR_NETWORK=testnet
NEAR_CONTRACT_NAME=your-contract-name.testnet
NODE_ENV=development
```

2. Add server scripts to `package.json`:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  }
}
```

3. Install development dependencies (optional but recommended):
```bash
npm install --save-dev nodemon jest
```

## Running the Server

1. Development mode (with auto-reload):
```bash
npm run dev
```

2. Production mode:
```bash
npm start
```

## API Documentation

### Collection Endpoints

#### Get All Collections
- **GET** `/api/get_all_collections`
- **Response**: Array of collection objects
```json
[
  {
    "id": 1,
    "name": "Collection Name",
    "contextWindow": 4096,
    "model": "base-model",
    "image": "image-url",
    "description": "Collection description",
    "creator": "creator.near",
    "date": 1635123456789,
    "owner": "owner.near"
  }
]
```

#### Get Collections by Address
- **GET** `/api/get_collections_by_address?address=user.near`
- **Query Parameters**: `address` (NEAR account ID)
- **Response**: Array of collection objects owned by the address

#### Get Collection by ID
- **GET** `/api/get_collection_by_id?collection_id=1`
- **Query Parameters**: `collection_id`
- **Response**: Detailed collection information

### NFT Endpoints

#### Get NFTs by Address
- **GET** `/api/get_nfts_by_address?address=user.near`
- **Query Parameters**: `address` (NEAR account ID)
- **Response**: Array of NFTs owned or accessible by the address

#### Get NFTs by Collection
- **GET** `/api/get_nfts_by_collection?collection_id=1`
- **Query Parameters**: `collection_id`
- **Response**: Array of NFTs in the collection

#### Get NFT by Collection ID and NFT ID
- **GET** `/api/get_nft_by_collectionid_nft_id?collection_id=1&nft_id=1`
- **Query Parameters**: 
  - `collection_id`
  - `nft_id`
- **Response**: Detailed NFT information

## Troubleshooting

### Common Issues and Solutions

1. **Connection Issues**
   - Verify NEAR network configuration
   - Check if the contract account exists
   - Ensure proper network connectivity

2. **Contract Errors**
   - Verify contract name in `.env`
   - Check if methods exist in the contract
   - Verify method parameters

3. **Server Issues**
   - Check port availability
   - Verify environment variables
   - Check logs for detailed error messages

### Logging

The server logs important information to the console. For production environments, consider implementing a proper logging solution:

```javascript
// Add to your error handling:
console.error({
  timestamp: new Date().toISOString(),
  error: err.message,
  stack: err.stack
});
```

### Health Check

Monitor server health using the `/health` endpoint:
```bash
curl http://localhost:3000/health
```

For production deployments, consider adding:
- PM2 for process management
- Monitoring tools (e.g., New Relic, Datadog)
- Docker containerization
- CI/CD pipeline configuration

Need help with any specific part of the setup? Let me know!