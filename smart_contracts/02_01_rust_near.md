
# Rust Smart Contract Development


## Setup NEAR Development Tools
```bash
# Install cargo-near for creating NEAR projects
cargo install cargo-near

# Create a new NEAR project
cargo near new your_project_name
cd your_project_name
```



## Project Structure
After creating a new project, you'll have the following structure:
```
your_project_name/
├── Cargo.toml
├── README.md
├── src/
│   └── lib.rs
└── target/
```

## Build and Test
```bash
# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test
```

## Environment Management
Remember to activate your conda environment before working:
```bash
conda activate near-dev
```

## Useful Commands
```bash
# View NEAR account status
near state <account_id>

# Deploy contract
near deploy --accountId <account_id> --wasmFile target/wasm32-unknown-unknown/release/<contract_name>.wasm

# Call contract methods
near call <contract_id> <method_name> '{"param": "value"}' --accountId <account_id>
```




