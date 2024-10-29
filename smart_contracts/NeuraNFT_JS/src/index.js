// index.js
import { NearBindgen, near, call, view, initialize, LookupMap, UnorderedMap } from "near-sdk-js";
import { NFTCore } from "./core/nft_core";
import { MetadataCore } from "./core/metadata_core";
import { AccessCore } from "./core/access_core";
import { CollectionCore } from "./core/collection_core";
import { NFTContractState } from "./storage/state";
import { NFTInterface } from "./interfaces/nft_interface";
import { MetadataInterface } from "./interfaces/metadata_interface";
import { AccessInterface } from "./interfaces/access_interface";
import { CollectionInterface } from "./interfaces/collection_interface";
import { NFTStandards } from "./standards/nep_implementation";
import { Validation } from "./utils/validation";
import { Assertions } from "./utils/assertions";
import { AccessLevel } from "./models";

@NearBindgen({})
export class Contract {
    constructor() {
        this.state = null;
        this.nftCore = null;
        this.metadataCore = null;
        this.accessCore = null;
        this.collectionCore = null;
        this.standards = null;
    }

    #assertInitialized() {
        if (!this.state) {
            near.panicUtf8("Contract must be initialized first");
        }
    }

    #assertAuthorized() {
        const caller = near.predecessorAccountId();
        const contractName = near.currentAccountId();
        // You can implement more sophisticated authorization here
        if (caller !== contractName) {
            near.panicUtf8("Unauthorized");
        }
    }

    @initialize({})
    init() {
        // Prevent double initialization
        if (this.state) {
            near.panicUtf8("Contract is already initialized");
        }

        // Initialize state and cores
        this.state          = new NFTContractState();
        this.nftCore        = new NFTCore(this.state);
        this.metadataCore   = new MetadataCore(this.state);
        this.accessCore     = new AccessCore(this.state);
        this.collectionCore = new CollectionCore(this.state);
        
        // Initialize standards
        this.standards      = new NFTStandards(this.nftCore);
        this.standards.init();

        near.log("Contract initialized");
    }

    // NFT Interface Methods
    @call({})
    create_nft({ collection_id, name, level_of_ownership, metadata = null }) {
        this.#assertInitialized();
        Assertions.assertAtLeastOneYocto();
        Validation.isValidOwnershipLevel(level_of_ownership);

        try {
            const token_id = this.nftCore.internal_create_nft(
                collection_id,
                name,
                level_of_ownership
            );

            if (metadata) {
                this.metadataCore.internal_create_metadata(collection_id, token_id, metadata);
            }

            near.log(`NFT Created - Collection: ${collection_id}, Token: ${token_id}`);
            return token_id;
        } catch (error) {
            near.panicUtf8(`Failed to create NFT: ${error}`);
        }
    }

    @call({})
    transfer_nft({ collection_id, token_id, receiver_id }) {
        this.#assertInitialized();
        Assertions.assertOneYocto();
        Validation.isValidAccountId(receiver_id);

        try {
            const sender_id = near.predecessorAccountId();
            this.nftCore.internal_transfer(sender_id, receiver_id, collection_id, token_id);
            near.log(`NFT Transferred - Collection: ${collection_id}, Token: ${token_id}, To: ${receiver_id}`);
            return true;
        } catch (error) {
            near.panicUtf8(`Transfer failed: ${error}`);
        }
    }

    @call({})
    burn_nft({ collection_id, token_id }) {
        this.#assertInitialized();
        Assertions.assertOneYocto();

        try {
            this.nftCore.internal_burn_nft(collection_id, token_id);
            near.log(`NFT Burned - Collection: ${collection_id}, Token: ${token_id}`);
            return true;
        } catch (error) {
            near.panicUtf8(`Burn failed: ${error}`);
        }
    }

    // Metadata Interface Methods
    @call({})
    set_metadata({ collection_id, token_id, metadata }) {
        this.#assertInitialized();
        Validation.validateMetadata(metadata);

        try {
            this.metadataCore.internal_create_metadata(collection_id, token_id, metadata);
            near.log(`Metadata Set - Collection: ${collection_id}, Token: ${token_id}`);
            return true;
        } catch (error) {
            near.panicUtf8(`Failed to set metadata: ${error}`);
        }
    }

    // Access Control Methods
    @call({})
    grant_access({ collection_id, token_id, account_id, access_level }) {
        this.#assertInitialized();
        Validation.isValidAccountId(account_id);

        try {
            this.accessCore.internal_grant_access(collection_id, token_id, account_id, access_level);
            near.log(`Access Granted - Collection: ${collection_id}, Token: ${token_id}, Account: ${account_id}`);
            return true;
        } catch (error) {
            near.panicUtf8(`Failed to grant access: ${error}`);
        }
    }

    // Collection Methods
    @call({})
    create_collection({ name, context_window, base_model, image, description }) {
        this.#assertInitialized();
        Validation.validateCollectionMetadata({ name, contextWindow: context_window, baseModel: base_model });

        try {
            const collection_id = this.collectionCore.internal_create_collection(
                name,
                context_window,
                base_model,
                image,
                description,
                near.predecessorAccountId()
            );
            near.log(`Collection Created - ID: ${collection_id}`);
            return collection_id;
        } catch (error) {
            near.panicUtf8(`Failed to create collection: ${error}`);
        }
    }

    // View Methods
    @view({})
    get_nft_info({ collection_id, token_id }) {
        this.#assertInitialized();
        return this.nftCore.internal_get_nft(collection_id, token_id);
    }

    @view({})
    get_metadata({ collection_id, token_id }) {
        this.#assertInitialized();
        return this.metadataCore.internal_get_metadata(collection_id, token_id);
    }

    @view({})
    get_collection({ collection_id }) {
        this.#assertInitialized();
        return this.collectionCore.internal_get_collection(collection_id);
    }

    @view({})
    get_access_level({ collection_id, token_id, account_id }) {
        this.#assertInitialized();
        return this.accessCore.internal_get_access_level(collection_id, token_id, account_id);
    }

    // NEP-171 Standard Methods
    @view({})
    nft_metadata() {
        this.#assertInitialized();
        return this.standards.nft_metadata();
    }

    @call({})
    nft_transfer({ receiver_id, token_id, approval_id = null, memo = null }) {
        this.#assertInitialized();
        return this.standards.nft_transfer({ receiver_id, token_id, approval_id, memo });
    }

    @view({})
    nft_token({ token_id }) {
        this.#assertInitialized();
        return this.standards.nft_token({ token_id });
    }

    // NEP-181 Standard Methods
    @view({})
    nft_total_supply() {
        this.#assertInitialized();
        return this.standards.nft_total_supply();
    }

    @view({})
    nft_tokens({ from_index = "0", limit = 50 }) {
        this.#assertInitialized();
        return this.standards.nft_tokens({ from_index, limit });
    }

    @view({})
    nft_supply_for_owner({ account_id }) {
        this.#assertInitialized();
        return this.standards.nft_supply_for_owner({ account_id });
    }

    // Error Recovery
    @call({})
    migrate_state() {
        this.#assertAuthorized();
        // Add state migration logic here if needed
        near.log("State migration completed");
        return true;
    }

    @view({})
    version() {
        return '1.0.0';
    }
}