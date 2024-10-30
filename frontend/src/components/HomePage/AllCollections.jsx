import React, { useEffect, useState, useRef } from "react";
import { useCommonLogic } from "./CommonComponet";
import { fetchData } from "../Utils/datafetch";
import styles from "./styles/allcollection.module.css";
import classNames from "classnames"; // Import classnames library


// Dummy data for NFTs
const dummyNFTs = [
  {
    id: 1,
    name: "Cosmic Dream #1",
    owner: "0x1234567890abcdef",
    collection: "AI Art Gallery",
    model: "DALL-E",
    numberOfOwners: 1,
    collectionId: 2,
    image: "/api/placeholder/50/50"
  },
  {
    id: 2,
    name: "Digital Punk #042",
    owner: "0xabcdef1234567890",
    collection: "Crypto Punks Collection",
    model: "GPT-4",
    numberOfOwners: 3,
    collectionId: 1,
    image: "/api/placeholder/50/50"
  },
  {
    id: 3,
    name: "Quantum Portal #7",
    owner: "0x2468101214161820",
    collection: "Quantum Art Collective",
    model: "Claude",
    numberOfOwners: 2,
    collectionId: 5,
    image: "/api/placeholder/50/50"
  },
  {
    id: 4,
    name: "Neural Dream #23",
    owner: "0x1357911131517192",
    collection: "Neural Network Narratives",
    model: "GPT-3",
    numberOfOwners: 1,
    collectionId: 4,
    image: "/api/placeholder/50/50"
  },
  {
    id: 5,
    name: "Meta Explorer #11",
    owner: "0x9876543210fedcba",
    collection: "Meta Multiverse",
    model: "GPT-4",
    numberOfOwners: 4,
    collectionId: 6,
    image: "/api/placeholder/50/50"
  }
];


// Adjust the path as needed
function AllCollections({ activeTab, setActiveTab }) {
  useEffect(() => {
    (async () => {
      const allCollectionsData = await fetchData("allCollections");
      console.log("Collectiondata",allCollectionsData);
      setCollectionsData(allCollectionsData);
      // const allNFTsData = await fetchData("allNFTs");
      setNftsData(dummyNFTs);
    })();
  }, []);

  const {
    navigate,
    allCollectionsRef,
    scrollToSection,
    handleCreateCollection,
  } = useCommonLogic();

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const [nftsData, setNftsData] = useState([]);
  const [collectionsData, setCollectionsData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(
    (activeTab === "allCollections"
      ? collectionsData.length
      : nftsData.length) / itemsPerPage
  );
  const currentCollections = collectionsData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const currentNFTs = nftsData.slice(indexOfFirstItem, indexOfLastItem);

  const handleRowClick = (id, type) => {
    if (type === "collection") {
      navigate(`/collection/${id}`);
    } else if (type === "nft") {
      navigate(`/nft/${id}`);
    }
  };

  const handleNFTClick = (collectionid, nftid) => {
    navigate(`/collection/${collectionid}/nft/${nftid}`);
  };

  const formatAddress = (addr) => {
    if (addr && addr.length > 10) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr || "Connect to Wallet";
  };

  return (
    <div>
      <div>
        <button
          className={classNames(styles.tab, {
            [styles.activeTab]: activeTab === "allCollections",
          })}
          onClick={() => {
            setActiveTab("allCollections");
            setCurrentPage(1);
          }}
        >
          All Collections
        </button>
        <button
          className={classNames(styles.tab, {
            [styles.activeTab]: activeTab === "allNFTs",
          })}
          onClick={() => {
            setActiveTab("allNFTs");
            setCurrentPage(1);
          }}
        >
          All NFTs
        </button>
      </div>
      <div className={styles.dataTable}>
      <div className={styles.tableContainer}>
        {activeTab === "allCollections" ? (
          <>
            <div className={styles.tableHeader}>
              <div className={styles.headerItem}># Collection</div>
              <div className={styles.headerItem}>Creator</div>
              <div className={styles.headerItem}>Model</div>
              <div className={styles.headerItem}>Description</div>
              <div className={styles.headerItem}>Context Window</div>
            </div>
            {currentCollections.map((item, index) => (
              <div
                key={item.id}
                className={styles.tableRow}
                onClick={() => handleRowClick(item.id, "collection")}
              >
                <div className={styles.rowItem}>
                  {/* <span className={styles.itemNumber}>{index + 1}</span> */}
                  <span className={styles.itemNumber}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                  <span className={styles.itemName}>{item.name}</span>
                </div>
                <div className={styles.rowItem}>
                  {(item.creator)}
                </div>
                <div className={styles.rowItem}>{item.model}</div>
                <div className={styles.rowItem}>{String(item.description).substring(0,30)}...</div>
                <div className={styles.rowItem}>{item.contextWindow}</div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className={styles.tableHeader}>
              <div className={styles.headerItem}># NFT</div>
              <div className={styles.headerItem}>Owner</div>
              <div className={styles.headerItem}>Collection</div>
              <div className={styles.headerItem}>Model</div>
              <div className={styles.headerItem}>Number of Owners</div>
            </div>
            {currentNFTs.map((item, index) => (
              <div
                key={item.id}
                className={styles.tableRow}
                onClick={() => handleNFTClick(item.collectionId, item.id)}
              >
                <div className={styles.rowItem}>
                  {/* <span className={styles.itemNumber}>{index + 1}</span> */}
                  <span className={styles.itemNumber}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                  <span className={styles.itemName}>{item.name}</span>
                </div>
                <div className={styles.rowItem}>
                  {(item.owner)}
                </div>

                <div className={styles.rowItem}>{item.collection}</div>
                <div className={styles.rowItem}>{item.model}</div>
                <div className={styles.rowItem}>{item.numberOfOwners}</div>
              </div>
            ))}
          </>
        )}
        </div>
      </div>
      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={classNames(styles.pageButton, {
                [styles.activePage]: currentPage === pageNumber,
              })}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default AllCollections;
