
#!/bin/bash
set -e

# Configuration
MASTER_ACCESS_ID="master-access.testnet"
NETWORK_ID="testnet"
ACCOUNT_ID="your-account.testnet"

# Build the contract
./scripts/build.sh

# Deploy the contract
echo "Deploying MasterAccessControl..."
near deploy --accountId $MASTER_ACCESS_ID \
    --wasmFile res/master_access_control.wasm \
    --initFunction 'new' \
    --initArgs "{\"owner_id\": \"$ACCOUNT_ID\"}" \
    --networkId $NETWORK_ID

# Test basic functionality
echo "Testing grant_access..."
near call $MASTER_ACCESS_ID grant_access "{\"contract_id\": \"test-contract.testnet\", \"caller_id\": \"test-user.testnet\"}" --accountId $ACCOUNT_ID

echo "Testing has_access..."
near view $MASTER_ACCESS_ID has_access "{\"contract_id\": \"test-contract.testnet\", \"caller_id\": \"test-user.testnet\"}"

echo "Testing revoke_access..."
near call $MASTER_ACCESS_ID revoke_access "{\"contract_id\": \"test-contract.testnet\", \"caller_id\": \"test-user.testnet\"}" --accountId $ACCOUNT_ID

echo "Verifying access revoked..."
near view $MASTER_ACCESS_ID has_access "{\"contract_id\": \"test-contract.testnet\", \"caller_id\": \"test-user.testnet\"}"