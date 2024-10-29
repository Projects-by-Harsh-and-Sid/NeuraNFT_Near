// contract.rs
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::{env, near_bindgen, AccountId, BorshStorageKey, PanicOnDefault};
use crate::contracts::master_access::events::{AccessGrantedLog, AccessRevokedLog};

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    AccessRights,
    ContractRights { contract_hash: Vec<u8> },
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct MasterAccessControl {
    // Main state - maps contract ID to a nested map of caller ID -> access rights
    access_rights: LookupMap<AccountId, LookupMap<AccountId, bool>>,
    owner_id: AccountId,
}

#[near_bindgen]
impl MasterAccessControl {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        let mut this = Self {
            access_rights: LookupMap::new(StorageKey::AccessRights),
            owner_id,
        };
        
        // Grant access to the deployer for the contract itself
        // this.internal_grant_access(env::current_account_id(), owner_id.clone());
        this.internal_grant_access(env::current_account_id(), this.owner_id.clone());

        
        // Log event
        AccessGrantedLog::log_event(
            env::current_account_id(),
            this.owner_id.clone(),
            Some("Initial owner access granted".to_string()),
        );
        
        this
    }

    // Owner-only functions
    #[payable]
    pub fn grant_access(&mut self, contract_id: AccountId, caller_id: AccountId) {
        self.assert_owner();
        self.internal_grant_access(contract_id.clone(), caller_id.clone());
        
        AccessGrantedLog::log_event(
            contract_id,
            caller_id,
            Some("Access granted by owner".to_string()),
        );
    }

    #[payable]
    pub fn revoke_access(&mut self, contract_id: AccountId, caller_id: AccountId) {
        self.assert_owner();
        self.internal_revoke_access(contract_id.clone(), caller_id.clone());
        
        AccessRevokedLog::log_event(
            contract_id,
            caller_id,
            Some("Access revoked by owner".to_string()),
        );
    }

    // Self-management functions
    #[payable]
    pub fn grant_self_access(&mut self, address_to_grant: AccountId) {
        let contract_id = env::predecessor_account_id();
        self.internal_grant_access(contract_id.clone(), address_to_grant.clone());
        
        AccessGrantedLog::log_event(
            contract_id,
            address_to_grant,
            Some("Self-granted access".to_string()),
        );
    }

    #[payable]
    pub fn revoke_self_access(&mut self, address_to_revoke: AccountId) {
        let contract_id = env::predecessor_account_id();
        self.internal_revoke_access(contract_id.clone(), address_to_revoke.clone());
        
        AccessRevokedLog::log_event(
            contract_id,
            address_to_revoke,
            Some("Self-revoked access".to_string()),
        );
    }

    // View functions
    pub fn has_access(&self, contract_id: AccountId, caller_id: AccountId) -> bool {
        self.internal_has_access(contract_id, caller_id)
    }

    pub fn self_check_access(&self, address_to_check: AccountId) -> bool {
        self.internal_has_access(env::predecessor_account_id(), address_to_check)
    }

    pub fn get_owner(&self) -> AccountId {
        self.owner_id.clone()
    }

    // Internal implementation
    fn internal_grant_access(&mut self, contract_id: AccountId, caller_id: AccountId) {
        let storage_key = StorageKey::ContractRights {
            contract_hash: env::sha256(contract_id.as_bytes()),
        };
        
        let mut contract_rights = self.access_rights
            .get(&contract_id)
            .unwrap_or_else(|| LookupMap::new(storage_key));
            
        contract_rights.insert(&caller_id, &true);
        self.access_rights.insert(&contract_id, &contract_rights);
    }

    fn internal_revoke_access(&mut self, contract_id: AccountId, caller_id: AccountId) {
        if let Some(mut contract_rights) = self.access_rights.get(&contract_id) {
            contract_rights.remove(&caller_id);
            self.access_rights.insert(&contract_id, &contract_rights);
        }
    }

    fn internal_has_access(&self, contract_id: AccountId, caller_id: AccountId) -> bool {
        self.access_rights
            .get(&contract_id)
            .map(|contract_rights| contract_rights.get(&caller_id).unwrap_or(false))
            .unwrap_or(false)
    }

    fn assert_owner(&self) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner_id,
            "Only owner can perform this action"
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::{testing_env, VMContext};

    fn get_context(predecessor: AccountId) -> VMContext {
        VMContextBuilder::new()
            .predecessor_account_id(predecessor)
            .build()
    }

    #[test]
    fn test_new() {
        let owner: AccountId = "owner.near".parse().unwrap();
        let context = get_context(owner.clone());
        testing_env!(context);

        let contract = MasterAccessControl::new(owner.clone());
        assert_eq!(contract.owner_id, owner);
    }

    #[test]
    fn test_grant_and_revoke() {
        let owner: AccountId = "owner.near".parse().unwrap();
        let contract_id: AccountId = "contract.near".parse().unwrap();
        let user: AccountId = "user.near".parse().unwrap();
        
        let context = get_context(owner.clone());
        testing_env!(context);

        let mut contract = MasterAccessControl::new(owner);
        
        // Test granting
        contract.grant_access(contract_id.clone(), user.clone());
        assert!(contract.has_access(contract_id.clone(), user.clone()));
        
        // Test revoking
        contract.revoke_access(contract_id.clone(), user.clone());
        assert!(!contract.has_access(contract_id, user));
    }

    #[test]
    #[should_panic(expected = "Only owner can perform this action")]
    fn test_unauthorized_grant() {
        let owner: AccountId = "owner.near".parse().unwrap();
        let other: AccountId = "other.near".parse().unwrap();
        let contract_id: AccountId = "contract.near".parse().unwrap();
        let user: AccountId = "user.near".parse().unwrap();
        
        let context = get_context(owner.clone());
        testing_env!(context);
        
        let mut contract = MasterAccessControl::new(owner);
        
        // Try to grant access as non-owner
        let context = get_context(other);
        testing_env!(context);
        contract.grant_access(contract_id, user);
    }
}