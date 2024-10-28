// tests/master_access_integration.rs
use near_workspaces::{Account, Contract, Worker};
use near_workspaces::network::Sandbox;
use near_workspaces::types::NearToken;
use serde_json::json;
use std::path::PathBuf;

// Helper function to find the WASM file
fn get_wasm_path() -> PathBuf {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("target");
    path.push("wasm32-unknown-unknown");
    path.push("release");
    path.push("neuranft.wasm");
    
    if !path.exists() {
        panic!(
            "Unable to find WASM file at {:?}. Please run 'cargo build --target wasm32-unknown-unknown --release' first",
            path
        );
    }
    
    path
}

async fn init() -> anyhow::Result<(Worker<Sandbox>, Contract, Account, Account)> {
    let worker = near_workspaces::sandbox().await?;
    
    // Deploy contract
    let wasm = std::fs::read(get_wasm_path())?;
    let contract = worker.dev_deploy(&wasm).await?;

    // Create test accounts
    let alice = worker.dev_create_account().await?;
    let bob = worker.dev_create_account().await?;

    // Initialize the contract
    contract
        .call("new")
        .args_json(json!({
            "owner_id": contract.id()
        }))
        .transact()
        .await?;

    Ok((worker, contract, alice, bob))
}

#[tokio::test]
async fn test_full_access_flow() -> anyhow::Result<()> {
    let (_worker, contract, alice, bob) = init().await?;

    // Grant access to Bob for Alice's contract
    let grant_result = contract
        .call("grant_access")
        .args_json(json!({
            "contract_id": alice.id(),
            "caller_id": bob.id()
        }))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;

    assert!(grant_result.is_success(), "Grant access failed: {:?}", grant_result);

    // Check if Bob has access
    let has_access: bool = contract
        .view("has_access")
        .args_json(json!({
            "contract_id": alice.id(),
            "caller_id": bob.id()
        }))
        .await?
        .json()?;

    assert!(has_access, "Expected Bob to have access");

    // Try to revoke access
    let revoke_result = contract
        .call("revoke_access")
        .args_json(json!({
            "contract_id": alice.id(),
            "caller_id": bob.id()
        }))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;

    assert!(revoke_result.is_success(), "Revoke access failed: {:?}", revoke_result);

    // Verify access is revoked
    let has_access_after_revoke: bool = contract
        .view("has_access")
        .args_json(json!({
            "contract_id": alice.id(),
            "caller_id": bob.id()
        }))
        .await?
        .json()?;

    assert!(!has_access_after_revoke, "Expected access to be revoked");

    Ok(())
}

#[tokio::test]
async fn test_self_access_management() -> anyhow::Result<()> {
    let (_worker, contract, alice, _bob) = init().await?;

    // Alice grants herself access
    let grant_result = alice
        .call(contract.id(), "grant_self_access")
        .args_json(json!({
            "address_to_grant": alice.id()
        }))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;

    assert!(grant_result.is_success(), "Self grant access failed: {:?}", grant_result);

    // Check if Alice has self-access
    let has_access: bool = contract
        .view("self_check_access")
        .args_json(json!({
            "address_to_check": alice.id()
        }))
        .await?
        .json()?;

    assert!(has_access, "Expected Alice to have self-access");

    // Alice revokes her own access
    let revoke_result = alice
        .call(contract.id(), "revoke_self_access")
        .args_json(json!({
            "address_to_revoke": alice.id()
        }))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;

    assert!(revoke_result.is_success(), "Self revoke access failed: {:?}", revoke_result);

    // Verify access is revoked
    let has_access_after_revoke: bool = contract
        .view("self_check_access")
        .args_json(json!({
            "address_to_check": alice.id()
        }))
        .await?
        .json()?;

    assert!(!has_access_after_revoke, "Expected self-access to be revoked");

    Ok(())
}

#[tokio::test]
async fn test_unauthorized_access() -> anyhow::Result<()> {
    let (_worker, contract, alice, bob) = init().await?;

    // Try to grant access as non-owner (should fail)
    let unauthorized_grant = alice
        .call(contract.id(), "grant_access")
        .args_json(json!({
            "contract_id": bob.id(),
            "caller_id": alice.id()
        }))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;

    assert!(unauthorized_grant.is_failure(), "Expected unauthorized grant to fail");

    Ok(())
}