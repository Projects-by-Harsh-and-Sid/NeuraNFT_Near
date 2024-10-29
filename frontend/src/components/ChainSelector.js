import React, { useState } from 'react';
import styles from '../styles/chainselector.module.css';

const ChainSelector = () => {
    const [selectedChain, setSelectedChain] = useState('Near Testnet');
    const chains = ['All Chains','Near Testnet'];
    const handleChainSelect = (chain) => {
        setSelectedChain(chain);
      };

      return (
        <div className={styles.chainSelectorContainer}>
          <div 
            className={`${styles.chainOption} ${selectedChain === 'All Chains' ? styles.selected : ''}`}
            onClick={() => handleChainSelect('All Chains')}
          >
            <img 
              src={selectedChain === 'All Chains' ? '/all-chain.svg' : '/all-chain-gey.svg'} 
              alt="All Chains"
              className={styles.chainIcon}
            />
            {selectedChain === 'All Chains' && <span className={styles.chainText}>All Chains</span>}
          </div>
          {/* <div 
            className={`${styles.chainOption} ${selectedChain === 'Tron' ? styles.selected : ''}`}
            onClick={() => handleChainSelect('Tron')}
          >
            <img 
              src={selectedChain === 'Tron' ? '/base-logo-in-blue.svg' : '/tron-grey.svg'} 
              alt="Tron"
              className={styles.chainIcon}
            />
            {selectedChain === 'Tron' && <span className={styles.chainText}>Tron</span>}
          </div> */}
          <div 
            className={`${styles.chainOption} ${selectedChain === 'Near Testnet' ? styles.selected : ''}`}
            onClick={() => handleChainSelect('Near Testnet')}
          >
            <img 
              src={selectedChain === 'Near Testnet' ? '/near-protocol-near-logo.svg' : '/near-protocol-grey.svg'} 
              alt="Tron"
              className={styles.chainIcon}
            />
            {selectedChain === 'Near Testnet' && <span className={styles.chainText}>Near Testnet</span>}
          </div>
        </div>
      );
    };
export default ChainSelector;