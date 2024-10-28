use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, Vector};
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault, Promise};
use near_sdk::serde::{Deserialize, Serialize};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AccessEntry {
    pub collection_id: String,
    pub nft_id: String,
    pub access_level: AccessLevel,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct UserAccess {
    pub user: AccountId,
    pub access_level: AccessLevel,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct NFTAccessControl {
    master_access: AccountId,
    // collection_id => nft_id => user => access_level
    nft_access: UnorderedMap<String, UnorderedMap<String, LookupMap<AccountId, AccessLevel>>>,
    // collection_id => nft_id => default_access_level
    default_access_levels: UnorderedMap<String, UnorderedMap<String, AccessLevel>>,
    // collection_id => nft_id => max_access_level
    max_access_levels: UnorderedMap<String, UnorderedMap<String, AccessLevel>>,
    // user => Vector<AccessEntry>
    user_access_list: LookupMap<AccountId, Vector<AccessEntry>>,
}

#[near_bindgen]
impl NFTAccessControl {
    #[init]
    pub fn new(master_access_contract: AccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            master_access: master_access_contract,
            nft_access: UnorderedMap::new(b"na"),
            default_access_levels: UnorderedMap::new(b"da"),
            max_access_levels: UnorderedMap::new(b"ma"),
            user_access_list: LookupMap::new(b"ua"),
        }
    }

    #[payable]
    pub fn grant_access(
        &mut self,
        collection_id: String,
        nft_id: String,
        user: AccountId,
        access_level: AccessLevel,
    ) {
        self.assert_can_modify_access();
        
        // Check max access level
        if let Some(max_level) = self.get_max_access_level(&collection_id, &nft_id) {
            assert!(
                matches!(access_level, AccessLevel::None) || matches!(max_level, AccessLevel::None) || 
                (access_level as u8) <= (max_level as u8),
                "Access level exceeds maximum allowed"
            );
        }

        // Update NFT access
        let mut collection_map = self.nft_access.get(&collection_id).unwrap_or_else(|| {
            UnorderedMap::new(format!("c_{}", collection_id).as_bytes())
        });
        let mut nft_map = collection_map.get(&nft_id).unwrap_or_else(|| {
            LookupMap::new(format!("n_{}_{}", collection_id, nft_id).as_bytes())
        });
        nft_map.insert(&user, &access_level);
        collection_map.insert(&nft_id, &nft_map);
        self.nft_access.insert(&collection_id, &collection_map);

        // Update user access list
        let mut user_entries = self.user_access_list.get(&user).unwrap_or_else(|| {
            Vector::new(format!("u_{}", user).as_bytes())
        });
        user_entries.push(&AccessEntry {
            collection_id: collection_id.clone(),
            nft_id: nft_id.clone(),
            access_level,
        });
        self.user_access_list.insert(&user, &user_entries);
    }

    pub fn revoke_access(&mut self, collection_id: String, nft_id: String, user: AccountId) {
        self.assert_can_modify_access();
        
        // Remove from NFT access
        if let Some(mut collection_map) = self.nft_access.get(&collection_id) {
            if let Some(mut nft_map) = collection_map.get(&nft_id) {
                nft_map.remove(&user);
                collection_map.insert(&nft_id, &nft_map);
                self.nft_access.insert(&collection_id, &collection_map);
            }
        }

        // Remove from user access list
        if let Some(mut user_entries) = self.user_access_list.get(&user) {
            let mut i = 0;
            while i < user_entries.len() {
                let entry = user_entries.get(i).unwrap();
                if entry.collection_id == collection_id && entry.nft_id == nft_id {
                    user_entries.swap_remove(i);
                    break;
                }
                i += 1;
            }
            self.user_access_list.insert(&user, &user_entries);
        }
    }

    pub fn set_max_access_level(
        &mut self,
        collection_id: String,
        nft_id: String,
        access_level: AccessLevel,
    ) {
        self.assert_can_modify_access();
        let mut collection_map = self.max_access_levels.get(&collection_id).unwrap_or_else(|| {
            UnorderedMap::new(format!("mc_{}", collection_id).as_bytes())
        });
        collection_map.insert(&nft_id, &access_level);
        self.max_access_levels.insert(&collection_id, &collection_map);
    }

    pub fn get_access_level(&self, collection_id: String, nft_id: String, user: AccountId) -> AccessLevel {
        if let Some(collection_map) = self.nft_access.get(&collection_id) {
            if let Some(nft_map) = collection_map.get(&nft_id) {
                if let Some(access_level) = nft_map.get(&user) {
                    return access_level;
                }
            }
        }
        
        // Return default access level if exists, otherwise None
        self.get_default_access_level(&collection_id, &nft_id)
            .unwrap_or(AccessLevel::None)
    }

    fn get_max_access_level(&self, collection_id: &String, nft_id: &String) -> Option<AccessLevel> {
        self.max_access_levels
            .get(collection_id)
            .and_then(|map| map.get(nft_id))
    }

    fn get_default_access_level(&self, collection_id: &String, nft_id: &String) -> Option<AccessLevel> {
        self.default_access_levels
            .get(collection_id)
            .and_then(|map| map.get(nft_id))
    }

    fn assert_can_modify_access(&self) {
        // Add your access control logic here
        // For example, check if caller is owner or has appropriate permissions
        assert!(
            env::predecessor_account_id() == self.master_access,
            "Unauthorized to modify access"
        );
    }
}