- [NEAR Protocol Account Creation and Deployment Guide](#near-protocol-account-creation-and-deployment-guide)
  - [1. Account Creation](#1-account-creation)
    - [Creating TestNet Account](#creating-testnet-account)
    - [Account Naming Rules](#account-naming-rules)
    - [Key Management](#key-management)
  - [2. Contract Deployment](#2-contract-deployment)
    - [Basic Deployment Commands](#basic-deployment-commands)
    - [Environment-Specific Deployment](#environment-specific-deployment)
  - [3. Contract Interaction](#3-contract-interaction)
    - [View Methods (Free, No Gas)](#view-methods-free-no-gas)
    - [Change Methods (Requires Gas)](#change-methods-requires-gas)
  - [4. Account Management](#4-account-management)
    - [Check Account State](#check-account-state)
    - [Managing Keys](#managing-keys)
  - [5. Practical Examples](#5-practical-examples)
    - [Complete Deployment Workflow](#complete-deployment-workflow)
    - [NFT Contract Example](#nft-contract-example)
    - [Token Contract Example](#token-contract-example)
  - [6. Troubleshooting](#6-troubleshooting)
    - [Common Issues and Solutions](#common-issues-and-solutions)



# NEAR Protocol Account Creation and Deployment Guide

## 1. Account Creation

### Creating TestNet Account

```bash
# Basic account creation using faucet
near create-account your-account.testnet --useFaucet

# Create account with initial balance
near create-account your-account.testnet --initialBalance 10 --useFaucet

# Create sub-account
near create-account sub-account.your-account.testnet --masterAccount your-account.testnet
```

### Account Naming Rules
- Must be between 2-64 characters
- Can contain lowercase letters (a-z), digits (0-9), and hyphens (-)
- Cannot start or end with a hyphen
- TestNet accounts end with `.testnet`
- MainNet accounts end with `.near`

### Key Management
After account creation, keys are stored at:
```bash
# TestNet keys
~/.near-credentials/testnet/your-account.testnet.json

# MainNet keys
~/.near-credentials/mainnet/your-account.near.json
```

Example key file content:
```json
{
  "account_id": "your-account.testnet",
  "public_key": "ed25519:XXXX...",
  "private_key": "ed25519:XXXX..."
}
```

## 2. Contract Deployment

### Basic Deployment Commands

```bash
# Deploy to TestNet
near deploy --accountId your-account.testnet --wasmFile build/contract.wasm

# Deploy to MainNet
near deploy --accountId your-account.near --wasmFile build/contract.wasm

# Deploy with initialization
near deploy --accountId your-account.testnet \
  --wasmFile build/contract.wasm \
  --initFunction init \
  --initArgs '{"param1": "value1"}'
```

### Environment-Specific Deployment

```bash
# Set environment
export NEAR_ENV=testnet  # or mainnet

# Deploy with specific network
near deploy --accountId your-account.testnet \
  --wasmFile build/contract.wasm \
  --networkId testnet
```

## 3. Contract Interaction

### View Methods (Free, No Gas)
```bash
# Basic view call
near view your-account.testnet get_status

# View with parameters
near view your-account.testnet get_info '{"key": "value"}'

# View with multiple parameters
near view your-account.testnet get_data '{
  "user": "alice.testnet",
  "index": 1,
  "limit": 10
}'
```

### Change Methods (Requires Gas)
```bash
# Basic call
near call your-account.testnet set_status '{"status": "active"}' \
  --accountId caller.testnet

# Call with attached deposit
near call your-account.testnet deposit '{"account": "bob.testnet"}' \
  --accountId caller.testnet \
  --deposit 10

# Call with specific gas
near call your-account.testnet complex_operation '{"data": "value"}' \
  --accountId caller.testnet \
  --gas 300000000000000
```

## 4. Account Management

### Check Account State
```bash
# View account details
near state your-account.testnet

# View account balance
near view-account your-account.testnet

# View access keys
near keys your-account.testnet
```

### Managing Keys
```bash
# Add access key
near add-key your-account.testnet ed25519:PUBLICKEY

# Delete access key
near delete-key your-account.testnet ed25519:PUBLICKEY

# Add function-call access key
near add-key your-account.testnet ed25519:PUBLICKEY \
  --contract-id contract.testnet \
  --method-names "method1,method2" \
  --allowance 10
```

## 5. Practical Examples

### Complete Deployment Workflow

```bash
# 1. Create account
near create-account myapp.testnet --useFaucet

# 2. Build contract
npm run build

# 3. Deploy contract
near deploy --accountId myapp.testnet --wasmFile build/contract.wasm

# 4. Initialize contract
near call myapp.testnet init '{"owner": "myapp.testnet"}' --accountId myapp.testnet

# 5. Verify deployment
near view myapp.testnet get_status
```

### NFT Contract Example
```bash
# Deploy NFT contract
near deploy --accountId nft.myapp.testnet \
  --wasmFile build/nft.wasm \
  --initFunction init \
  --initArgs '{
    "owner_id": "myapp.testnet",
    "metadata": {
      "spec": "nft-1.0.0",
      "name": "My NFT Collection",
      "symbol": "MNFT"
    }
  }'

# Mint NFT
near call nft.myapp.testnet nft_mint '{
  "token_id": "token-1",
  "metadata": {
    "title": "My First NFT",
    "description": "This is NFT #1",
    "media": "https://example.com/nft-1.png"
  },
  "receiver_id": "recipient.testnet"
}' --accountId myapp.testnet --deposit 0.1
```

### Token Contract Example
```bash
# Deploy token contract
near deploy --accountId token.myapp.testnet \
  --wasmFile build/token.wasm \
  --initFunction init \
  --initArgs '{
    "owner_id": "myapp.testnet",
    "total_supply": "1000000000",
    "metadata": {
      "spec": "ft-1.0.0",
      "name": "My Token",
      "symbol": "MTK",
      "decimals": 18
    }
  }'

# Transfer tokens
near call token.myapp.testnet ft_transfer '{
  "receiver_id": "user.testnet",
  "amount": "100000000"
}' --accountId myapp.testnet --deposit 0.000000000000000000000001
```

## 6. Troubleshooting

### Common Issues and Solutions

1. **Account Already Exists**
```bash
# Check if account exists
near state your-account.testnet

# Use different account name if exists
near create-account your-account-2.testnet --useFaucet
```

2. **Insufficient Balance**
```bash
# Check account balance
near state your-account.testnet

# Add funds using faucet (TestNet only)
near send faucet.testnet your-account.testnet 10
```

3. **Invalid Deployment**
```bash
# Verify WASM file
ls -l build/contract.wasm

# Rebuild and redeploy
npm run build
near deploy --accountId your-account.testnet --wasmFile build/contract.wasm --force
```

4. **Method Not Found**
```bash
# Check contract methods
near view your-account.testnet list_methods

# Verify method name and parameters
near view your-account.testnet get_method_names
```

Always remember to:
- Keep your key files secure
- Use TestNet for development and testing
- Verify contract code before MainNet deployment
- Monitor gas costs for change methods
- Back up your credentials