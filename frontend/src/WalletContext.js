import React, { createContext, useState, useEffect, useContext } from 'react';
import * as nearAPI from 'near-api-js';

const { connect, keyStores, WalletConnection } = nearAPI;
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [nearState, setnearState] = useState({
    installed: false,
    loggedIn: false,
  });
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [walletConnection, setWalletConnection] = useState(null);

  const APP_KEY_PREFIX = "near_app";
  const connectionConfig = {
    networkId: "testnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://testnet.mynearwallet.com/",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://testnet.nearblocks.io",
  };

  useEffect(() => {
    const init = async () => {
      try {
        const nearConnection = await connect(connectionConfig);
        const walletConn = new WalletConnection(nearConnection, APP_KEY_PREFIX);
        setWalletConnection(walletConn);
        setnearState(prev => ({ ...prev, installed: true }));

        // Check if user is already signed in
        if (walletConn.isSignedIn()) {
          const accountId = walletConn.getAccountId();
          setAddress(accountId);
          setnearState({
            installed: true,
            loggedIn: true,
          });

          // Get balance
          const account = await walletConn.account();
          const balanceInfo = await account.getAccountBalance();
          setBalance(nearAPI.utils.format.formatNearAmount(balanceInfo.total));
        }
      } catch (error) {
        console.error('Error initializing NEAR wallet:', error);
      }
    };

    init();
  }, []);

  const connectWallet = async () => {
    try {
      if (!walletConnection) {
        console.error('Wallet connection not initialized');
        return;
      }

      const currentDomain = window.location.origin;
      const currentPath = window.location.href; // Gets full URL including path
      
      await walletConnection.requestSignIn({
        successUrl: currentPath,
        failureUrl: currentPath,
      });

      if (walletConnection.isSignedIn()) {
        const accountId = walletConnection.getAccountId();
        setAddress(accountId);
        setnearState({
          installed: true,
          loggedIn: true,
        });

        // Get balance after connection
        const account = await walletConnection.account();
        const balanceInfo = await account.getAccountBalance();
        setBalance(nearAPI.utils.format.formatNearAmount(balanceInfo.total));
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = async () => {
    try {
      if (!walletConnection) return;

      walletConnection.signOut();
      setnearState({
        installed: true,
        loggedIn: false,
      });
      setAddress(null);
      setBalance(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const checkAccountExists = async (accountId) => {
    try {
      const nearConnection = await connect(connectionConfig);
      const account = await nearConnection.account(accountId);
      await account.state();
      return true;
    } catch (error) {
      if (error.toString().includes('does not exist')) {
        return false;
      }
      throw error;
    }
  };

  const value = {
    nearState,
    address,
    balance,
    walletConnection,
    connectWallet,
    disconnectWallet,
    checkAccountExists,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};