use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenMetadata {
    pub image: Option<String>,
    pub base_model: Option<String>,
    pub data_url: Option<String>,
    pub rag_url: Option<String>,
    pub fine_tune_data: Option<String>,
    pub description: Option<String>,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub enum AccessLevel {
    None,
    UseModel,
    Resale,
    CreateReplica,
    ViewAndDownload,
    EditData,
    AbsoluteOwnership,
}

impl Default for AccessLevel {
    fn default() -> Self {
        AccessLevel::None
    }
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct CollectionMetadata {
    pub name: String,
    pub context_window: u64,
    pub base_model: String,
    pub image: String,
    pub description: String,
    pub creator_id: AccountId,
    pub created_at: u64,
    pub owner_id: AccountId,
}