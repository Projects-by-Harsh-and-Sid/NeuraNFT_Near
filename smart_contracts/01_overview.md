# Near Blockchain Development Guide

Welcome to the comprehensive guide for developing on the Near blockchain. This guide will walk you through the entire process of setting up your environment, writing smart contracts, deploying them, and interacting with them using various tools.

Consolidated with ❤️ by the NeuraNFT team.

## Table of Contents

- [Near Blockchain Development Guide](#near-blockchain-development-guide)
  - [Table of Contents](#table-of-contents)
    - [Documentation](#documentation)
  - [Useful Links](#useful-links)
- [NEAR Development Environment Setup Guide](#near-development-environment-setup-guide)
  - [1. WSL and Anaconda Base Setup](#1-wsl-and-anaconda-base-setup)
    - [Install WSL](#install-wsl)
    - [Basic WSL Dependencies](#basic-wsl-dependencies)
    - [Install Anaconda](#install-anaconda)
  - [2. Rust and Node.js Setup](#2-rust-and-nodejs-setup)
    - [Install Rust](#install-rust)
    - [Install Node.js in Anaconda Environment](#install-nodejs-in-anaconda-environment)
  - [3. NEAR Development Setup](#3-near-development-setup)
    - [Install NEAR CLI](#install-near-cli)
  - [Useful Commands for Development](#useful-commands-for-development)
- [Troubleshooting](#troubleshooting)
- [Navigation](#navigation)



### Documentation
- [NEAR Documentation](https://docs.near.org)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Anaconda Documentation](https://docs.anaconda.com)
- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Windows installation](https://docs.near.org/blog/getting-started-on-windows)

## Useful Links

- [cargo-near](https://github.com/near/cargo-near) - NEAR smart contract development toolkit for Rust
- [near CLI](https://near.cli.rs) - Interact with NEAR blockchain from command line
- [NEAR Rust SDK Documentation](https://docs.near.org/sdk/rust/introduction)
- [NEAR Documentation](https://docs.near.org)
- [NEAR StackOverflow](https://stackoverflow.com/questions/tagged/nearprotocol)
- [NEAR Discord](https://near.chat)
- [NEAR Telegram Developers Community Group](https://t.me/neardev)
- NEAR DevHub: [Telegram](https://t.me/neardevhub), [Twitter](https://twitter.com/neardevhub)



# NEAR Development Environment Setup Guide

This guide provides step-by-step instructions for setting up a NEAR development environment using WSL, Anaconda, Rust, and Node.js.

## 1. WSL and Anaconda Base Setup

### Install WSL
```bash
# Open PowerShell as Administrator and run:
wsl --install
# Restart your computer
```

### Basic WSL Dependencies
```bash
sudo apt update && sudo apt upgrade
sudo apt install -y build-essential curl wget git pkg-config libssl-dev
```

### Install Anaconda
```bash
# Download Anaconda
wget https://repo.anaconda.com/archive/Anaconda3-2024.02-Linux-x86_64.sh

# Install Anaconda
bash Anaconda3-2024.02-Linux-x86_64.sh
# Follow the prompts and accept the license agreement
# Say 'yes' to initializing conda

# Activate Anaconda
source ~/.bashrc

# Verify installation
conda --version
```

## 2. Rust and Node.js Setup

### Install Rust
```bash
# Install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Choose option 1 for default installation

# Add Rust to current shell
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version

# Add WebAssembly target
rustup target add wasm32-unknown-unknown
```

### Install Node.js in Anaconda Environment
```bash
# Create a new conda environment for NEAR development
conda create -n near-dev python=3.12
conda activate near-dev

# Install Node.js through conda
conda install nodejs

# Verify Node.js installation
node --version
npm --version
```

## 3. NEAR Development Setup

### Install NEAR CLI
```bash
# Install NEAR CLI globally
npm install -g near-cli

# Verify NEAR CLI installation
near --version
```

## Useful Commands for Development

```bash
# Create new account
near create-account your-account.testnet --masterAccount testnet

# Delete account
near delete your-account.testnet your-master-account.testnet

# View account details
near state your-account.testnet

# View logs
near view-state your-account.testnet --finality final
```



# Troubleshooting

Common issues and solutions:

1. If Rust commands aren't found:
```bash
source $HOME/.cargo/env
```

2. If conda commands aren't found:
```bash
source ~/.bashrc
```

3. If Node.js packages aren't found:
```bash
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

4. WSL filesystem issues:
```bash
# Run from Windows PowerShell:
wsl --shutdown
wsl
```

___

# Navigation

<!-- Next button -->

<button style = "height: 40px"> <a href="./02_02_near_js.md"> Near JS Overview </a> </button>
<button style = "height: 40px; float: right"> <a href="./02_01_rust_near.md"> Near Rust Overview </a> </button>