use near_sdk::AccountId;
use near_sdk::serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AccessGrantedLog {
    pub contract_address: AccountId,
    pub caller: AccountId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memo: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AccessRevokedLog {
    pub contract_address: AccountId,
    pub caller: AccountId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memo: Option<String>,
}

impl AccessGrantedLog {
    pub fn log_event(contract_id: AccountId, caller_id: AccountId, memo: Option<String>) {
        near_sdk::env::log_str(
            &near_sdk::serde_json::to_string(&Self {
                contract_address: contract_id,
                caller: caller_id,
                memo,
            })
            .unwrap(),
        );
    }
}

impl AccessRevokedLog {
    pub fn log_event(contract_id: AccountId, caller_id: AccountId, memo: Option<String>) {
        near_sdk::env::log_str(
            &near_sdk::serde_json::to_string(&Self {
                contract_address: contract_id,
                caller: caller_id,
                memo,
            })
            .unwrap(),
        );
    }
}