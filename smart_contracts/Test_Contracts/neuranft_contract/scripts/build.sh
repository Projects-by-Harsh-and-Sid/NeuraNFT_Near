#!/bin/bash
set -e

# Navigate to project root
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR/.."

# Build the contract
echo "Building contract..."
RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release

# Copy the wasm file to a convenient location
mkdir -p res
cp target/wasm32-unknown-unknown/release/*.wasm ./res/

echo "Build completed successfully!"
