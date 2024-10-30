
- [Rust Smart Contract Development](#rust-smart-contract-development)
  - [Setup NEAR Development Tools](#setup-near-development-tools)
  - [Project Structure](#project-structure)
  - [Build and Test](#build-and-test)
  - [Environment Management](#environment-management)
  - [Useful Commands](#useful-commands)
- [Navigation](#navigation)


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

# Navigation

<button style = "height: 40px"> <a href="./01_overview.md"> Previous Overview </a> </button>
<button style = "height: 40px; float: right"> <a href="./03_build_and_testing.md"> Building and Testing </a> </button>


