# NeuraNFT

NeuraNFT is a blockchain-based platform built on the NEAR Protocol that revolutionizes how AI models and datasets are managed, shared, and monetized. By leveraging NEAR's infrastructure, NeuraNFT transforms AI assets into unique digital tokens (NFTs), allowing creators to maintain ownership while providing a secure way to share and trade their intellectual property.

Through smart contract, the platform implements detailed permission controls that let owners specify exactly how their AI models and data can be used. At its core is a decentralized marketplace where developers, data scientists, data owners and organizations can confidently buy, sell, or lease these tokenized assets, knowing their intellectual property rights are protected.

NeuraNFT represents a perfect synergy between AI and Web3 technologies, addressing critical challenges in both spaces. By tokenizing AI models and datasets, we're not just creating a marketplace - we're building a new ecosystem where AI development becomes more transparent, accessible, and secure. Our platform ensures secure model deployment and inference, enabling users to utilize AI models without exposing the underlying code or data, thus maintaining the delicate balance between accessibility and security in the ecosystem.


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

#### Running the application in debug mode

1. Run the HPC node
2. Run the ` docker compose -f  docker-compose-debug.yml up --build` command to start the frontend, backend and nginx server
3. `npm start` in react
4. start debugging in vscode (node+flask+reactweb debug) - dropdown in debug tab in vscode


#### Running the application in local host mode 
1. docker compose -f  docker-compose-local-.yml up --build




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
      - [Running the application in debug mode](#running-the-application-in-debug-mode)
      - [Running the application in local host mode](#running-the-application-in-local-host-mode)
    - [Note check these files for local deployment](#note-check-these-files-for-local-deployment)
  - [Table of Contents](#table-of-contents)
  - [Documentation](#documentation)
  - [Key Features](#key-features)
  - [Problem Statement](#problem-statement)
  - [Architecture](#architecture)
    - [React Frontend and Near Wallet Integration](#react-frontend-and-near-wallet-integration)
    - [Flask, Express backend and Federated AI Learning System](#flask-express-backend-and-federated-ai-learning-system)
    - [Smart Contract](#smart-contract)
    - [Balancer Nodes](#balancer-nodes)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Operational Flow](#operational-flow)
  - [Technologies Used](#technologies-used)
  - [Smart Contracts](#smart-contracts)
  - [What's next for NeuraNFT](#whats-next-for-neuranft)

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


NeuraNFT project can be divided into 4 components. 

1.	Frontend: build on react
2.	Backends: Flask (Python) and Express(Node)
3.	Smart Contract: Type Script, Java Script and Rust(Under Development)
4.	HPC Node: High Performance Computing Node for AI model inference (soon to be replaced by decentralized nodes with DRM)


### React Frontend and Near Wallet Integration
The frontend is built in react and integrates with NEAR Wallet. When we deploy the code in production the frontend code is compiled, and the static build is exported to nginx container from where it is deployed. This makes the frontend request comparatively faster than running a native npm server build. 

### Flask, Express backend and Federated AI Learning System
The backend infrastructure employs a distributed Python framework (Flask) orchestrated through Docker containers. The master node architecture handles model deployment and encryption through a implementation of asymmetric cryptography(ECDH + AES). We developed a custom balancer system for signature verification and permission validation, which runs as a separate microservice. Currently this system is centralized but we are developing a distributed DRM layer that will enable secure model deployment enabling users to participate in the network. This layer will combine with the HPC node network to also manage encryption keys like Shamir secrete. 



We also created a nginx server that acts a reverse proxy for these request and enables metadata request caching. All of these are deployed using docker with a single exposed nginx endpoint. 




### Smart Contract


We built a specialized NFT smart contract for AI models that solves the tricky problem of managing AI model ownership and access rights on the blockchain. Instead of just basic ownership like regular NFTs, we created a more nuanced system where different users can have varying levels of access to the same model - from basic usage rights all the way up to full ownership and editing capabilities.

We organized everything into collections to keep it clean and manageable. Each collection can represent a family of related AI models, and within each collection, we can mint individual NFTs. What's cool is that we built in a really flexible access control system - so model creators can grant specific permissions to different users. For example, you might let some users just use the model, while others can create derivatives, and others might have full editing rights.

> Kindly open the image in a new tab to see in detail

![Smart Contract Read functions](https://raw.githubusercontent.com/Projects-by-Harsh-and-Sid/NeuraNFT_Near/refs/heads/main/smart_contracts/smartContractArcitecture_read_request.svg)

For the technical implementation, we used NEAR's blockchain and built everything with security in mind. We made sure to add proper checks so only authorized users can do sensitive stuff like transferring NFTs or updating model data. We also added comprehensive view methods so users can easily see what models they have access to, what permissions they have, and all the associated metadata about the models.

> Kindly open the image in a new tab to see in detail

![Smart Contract Write](https://raw.githubusercontent.com/Projects-by-Harsh-and-Sid/NeuraNFT_Near/refs/heads/main/smart_contracts/smartContractArcitecture_write_request.svg)


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

## What's next for NeuraNFT

1.	**Smart Contract Optimization**: Refine contracts for better performance.
2.	**Advanced NFT Functionalities**: Implement model combination and fractional/shared ownership features.
3.	**Robust Marketplace Development**: Create a comprehensive marketplace with advanced search and discovery features.
4.	**AI Agents**: Developing a platform to enable users to leverage neuranft and develop custom AI agents and AI workflows. Something like ComfyUI but decentralized.
5. 	**Neura Bridge**: Enabling users to wrap NFTs in popular token standards and monetize them on multiple chain and market places
6.	**Governance Mechanisms**: Introduce decentralized governance for community-driven decision-making.
7.	**Expanded Compute Network**: Develop a more efficient decentralized compute network for model deployment.
8.	**AI-to-AI Interaction Protocols**: Enable secure interactions between AI models within the ecosystem.
9.	**Cross-chain Interoperability**: Explore integration with other blockchain networks.
10.	**Industry Partnerships**: Establish partnerships with AI researchers, companies, and institutions.





