# NeuraNFT

NeuraNFT is a platform built on the Near blockchain that aims to tokenize intelligence. It enables the creation of NFTs representing AI models and data, with a permission management system for granular control over access and usage rights. By addressing key challenges in the current AI ecosystem, NeuraNFT seeks to create a more equitable, secure, and innovative environment for AI development and deployment.


## How to run the project

1. Clone the repository:
  ```bash
      git clone git@github.com:Projects-by-Harsh-and-Sid/NeuraNFT_Near.git
   ```

2. Run the following commands to deploy the smart contracts on the near blockchain:

   ```bash
   cd smart_contracts/NeuraNFT_JS/
   npm run build
   near create-account your-account.testnet --useFaucet
   near deploy --accountId your-account.testnet --wasmFile build/NeuraNFTOptimizedTS.wasm
   ```

3. Run docker-compose to start the HPC node
   ```bash
   cd hpc_node
   docker-compose up
   ```

4. Start the frontend, backend and nginx server
   ```bash
   docker-compose up --build
   ```
5. Stop containers
   ```bash
      docker-compose down
   ```
6. Compose a specific service

   ```bash
   docker-compose up <service_name>
   ```
7. compose a specific service in detached mode

   ```bash
   docker-compose up -d <service_name>
   ```

8. compose a specific file

   ```bash
   docker-compose -f <file_name> up
   ```

   eg

   ```
   docker compose -f  docker-compose-local-debug.yml up --build
   ```

### Note check these files for local deployment

<u>__Frontend__</u>

`frontend\src\endpoints.json`

for local deployment, the file should look like this:

```json
{"BACKEND_URL": "http://localhost:6010"}
```
for web deployment, the file should look like this:

```json
{"BACKEND_URL": "https://near.backend.neuranft.com"}
```
> replace `https://near.backend.neuranft.com` with the actual backend URL

<u>__Backend__</u>

`master_node\app\__init__.py`

for local deployment, the file should look like this:

```python

app.config["Load_balancer_Endpoints"] = {
    "hpcEndpoint": "http://localhost",
    "hpcEndpointPort": "5500",
}

app.config["filestorage_endpoint"] = "http://localhost:5500"
```

for web deployment, the file should look like this:

```python

app.config["Load_balancer_Endpoints"] = {
    "hpcEndpoint": "https://near.backend.neuranft.com",
    "hpcEndpointPort": "443",
}

app.config["filestorage_endpoint"] = "https://near.backend.neuranft.com"
```
> replace `https://near.backend.neuranft.com` with the actual backend URL

_____


## Table of Contents

- [NeuraNFT](#neuranft)
  - [How to run the project](#how-to-run-the-project)
    - [Note check these files for local deployment](#note-check-these-files-for-local-deployment)
  - [Table of Contents](#table-of-contents)
  - [Documentation](#documentation)
  - [Key Features](#key-features)
  - [Problem Statement](#problem-statement)
  - [Architecture](#architecture)
    - [Smart Contracts](#smart-contracts)
    - [Balancer Nodes](#balancer-nodes)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Operational Flow](#operational-flow)
  - [Technologies Used](#technologies-used)
  - [Smart Contracts](#smart-contracts-1)
  - [Future Developments](#future-developments)
  - [Architecture Diagram](#architecture-diagram)
    - [Smart Contract Architecture](#smart-contract-architecture)
- [Migration Output](#migration-output)

## Documentation

We have detailed documentation available in the `/smart_contracts/` directory to help you understand and work with the NeuraNFT smart contracts:

1. [Overview](/smart_contracts/01_overview.md): Provides a general overview of the NeuraNFT smart contract system and its components.

2. [Compiling Smart Contracts](/smart_contracts/02_compiling_smart_contracts.md): Explains the process of compiling the smart contracts and outlines the project structure.

3. [Migration](/smart_contracts/03_migration.md): Details the deployment script and process, including updates to the Solidity version 0.8.7.

4. [Testing on CLI](/smart_contracts/04_testing_on_cli.md): Guides you through testing the smart contracts using the command-line interface.

5. [Code Testing](/smart_contracts/05_code_testing.md): Covers the code testing process and best practices for ensuring contract reliability.

6. [Build Data Use in React WebApp](/smart_contracts/06_build_data_use_in_react_webapp.md): Explains how to integrate the compiled contract data into a React web application.

These documents provide comprehensive guidance on working with the NeuraNFT smart contracts, from compilation to testing and integration with the frontend.

For Information about the HPC node setup, please refer to the `/hpc_node/` document:

1. [HPC Node Setup](/hpc_node/hpc_node.md): Provides a detailed guide on setting up the HPC nodes for the NeuraNFT platform.





## Key Features

1. **NFT Creation for AI Models and Data**: Tokenize AI models and datasets as unique digital assets.
2. **Granular Permission Management**: Fine-tuned access control for different levels of data and model usage.
3. **Secure, Encrypted Data Storage**: Utilizes BTFS (BitTorrent File System) for decentralized and secure storage.
4. **Controlled Access to Models and Data**: Smart contract-based access control ensures only authorized users can interact with the assets.
5. **Secure Model Deployment and Inference**: Enables secure deployment and use of AI models without compromising intellectual property.
6. **AI Marketplace**: A decentralized marketplace for buying, selling, and leasing AI models and datasets.

## Problem Statement

NeuraNFT addresses several key challenges in the current AI ecosystem:

- Lack of control and fair compensation for data owners
- Difficulties for independent creators in monetizing their innovations
- Limited data control and high costs for end users
- Corporate hesitation to use centrally deployed models due to data privacy concerns
- IP infringement risks for model owners when hosting on client servers
- Limited true ownership and transferability of AI assets
- Inefficient resource management for personalized AI

## Architecture

NeuraNFT's architecture is designed with security, scalability, and user control at its forefront. It consists of several key components:

```mermaid

graph TB
    subgraph Core Contracts
        MC[Master Contract]
        NC[NFT Contract]
        CC[Collection Contract]
    end
    
    subgraph Storage Contracts
        MS[Metadata Storage]
        AS[Access Control Storage]
    end
    
    MC --> NC
    MC --> CC
    NC --> MS
    NC --> AS
    CC --> NC
    
    subgraph Storage Types
        CMS[Collection Metadata]
        NMS[NFT Metadata]
        ACS[Access Control State]
    end
    
    MS --> CMS
    MS --> NMS
    AS --> ACS

```


### Balancer Nodes
Responsible for verifying access requests, ensuring only authorized parties can interact with the models and data.

### Frontend
- Provides user interface for interacting with the platform.
- Handles message signing for verification purposes.

### Backend
- Manages signature verification.
- Performs permission checks.
- Handles data decryption and model deployment.

### Operational Flow
1. User creates an NFT representing their AI model or dataset.
2. Owner grants varying levels of permissions to other users.
3. For access requests, a balancer node sends a verification message.
4. Frontend signs the message and sends it to the backend.
5. Backend verifies the signature and checks permissions.
6. If permissions match, data is decrypted or model is deployed for inference.

## Technologies Used

- **Near Blockchain**: Foundation of the decentralized system.
- **Smart Contracts (Solidity)**: Implements core logic for NFTs and permissions.
- **React**: Powers the frontend user interface.
- **Python**: Drives backend operations.
- **Python Encryption Libraries**: Ensure data security throughout the system.

## Smart Contracts

The following smart contracts have been deployed on the Near testnet:

- [neuranft_test1.testnet (testing contract deployment on TestNet)](https://testnet.nearblocks.io/address/neuranft_test1.testnet)(Testing contract deployed on TestNet)

- [neuranft.testnet](https://testnet.nearblocks.io/address/neuranft.testnet)(Main contract deployed on TestNet)

## Future Developments

1. **Smart Contract Optimization**: Refine contracts for better performance and lower fees.
2. **Advanced NFT Functionalities**: Implement model combination and fractional ownership features.
3. **Robust Marketplace Development**: Create a comprehensive marketplace with advanced search and discovery features.
4. **Governance Mechanisms**: Introduce decentralized governance for community-driven decision-making.
5. **Expanded Compute Network**: Develop a more efficient decentralized compute network for model deployment.
6. **AI-to-AI Interaction Protocols**: Enable secure interactions between AI models within the ecosystem.
7. **Cross-chain Interoperability**: Explore integration with other blockchain networks.
8. **Industry Partnerships**: Establish partnerships with AI researchers, companies, and institutions.

## Architecture Diagram

```mermaid
graph LR
    UI[User Interface]
    TW[Base Wallet]

    UI --> TW
    UI --"User Actions"-->BS
    TW --"Sign & Execute Contracts"-->SC

    subgraph "User Interaction Layer"
        UI --"UI Webpage"--- UI
        TW --"NFT Creation & Metadata Update"--- TW
    end

    subgraph "Backend Services"
        direction TB
        BS[Backend System]
        UV[User Verification]
        AC[Access Check]
        ED[Data Encryption/Decryption]
        MI[Model Interface]
        API[Other APIs]
        BS --> UV
        BS --> AC
        BS --> ED
        BS --> MI
        BS --> API
    end

    BS --"Data Storage/Retrieval"-->BTFS
    BS --"Compute Tasks"-->HPC
    AC --"Verify Permissions"-->SC

    BTFS[BTFS Storage]

    subgraph "HPC Nodes"
        HPC[High-Performance Computing]
        SN1[Node 1: Model Training]
        SN2[Node 2: Inference]
        SN3[Node 3: Fine-tuning]
        HPC --> SN1
        HPC --> SN2
        HPC --> SN3
    end

    subgraph "Base Network Smart Contracts"
        SC[Smart Contracts]
        NFT[NFT Contract]
        ACC[Access Control Contract]
        MD[Metadata Contract]
        CC[Collection Contract]
        MAC[Master Access Control]
        SC --> NFT
        SC --> ACC
        SC --> MD
        SC --> CC
        SC --> MAC
        NFT --"ownerOf()"-->NFT
        ACC --"checkAccess()"-->MAC
        MD --"getMetadata()"-->MD
        CC --"getCollectionInfo()"-->CC
        MAC --"hasAccess()"-->MAC
    end

    classDef default fill:#f0f0f0,stroke:#333,stroke-width:2px,color:#000;
    classDef Base fill:#ffd700,stroke:#333,stroke-width:2px,color:#000;
    classDef computing fill:#87cefa,stroke:#333,stroke-width:2px,color:#000;
    classDef storage fill:#90EE90,stroke:#333,stroke-width:2px,color:#000;
    classDef backend fill:#ff6347,stroke:#333,stroke-width:2px,color:#000;
    classDef user fill:#c8a2c8,stroke:#333,stroke-width:2px,color:#000;

    class SC,NFT,ACC,MD,CC,MAC Base;
    class HPC,SN1,SN2,SN3 computing;
    class BTFS storage;
    class BS,UV,AC,ED,MI,API backend;
    class UI,TW user;
```

### Smart Contract Architecture
> Kindly open the image in a new tab to see in detial
![Smart Contract Architecture](https://raw.githubusercontent.com/Projects-by-Harsh-and-Sid/NeuraNFT_Near/refs/heads/main/smart_contracts/smartContractFlow-white.svg?token=GHSAT0AAAAAACVLNDR6PMXCJJLL6R7VZZBSZYFBSBA? "Smart Contract Architecture")

