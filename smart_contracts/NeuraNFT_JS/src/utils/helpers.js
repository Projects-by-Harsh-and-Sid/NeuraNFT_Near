// utils/helpers.js
import { near } from "near-sdk-js";
import { AccessLevel } from "../models";

export class Helpers {
    static generateTokenId(collectionId, tokenNumber) {
        return `${collectionId}-${tokenNumber}`;
    }

    static parseTokenId(tokenId) {
        const [collectionId, tokenNumber] = tokenId.split('-');
        return {
            collectionId: parseInt(collectionId),
            tokenNumber: parseInt(tokenNumber)
        };
    }

    static formatBalance(balance) {
        return balance.toLocaleString('fullwide', { useGrouping: false });
    }

    static serializeAccessEntry(entry) {
        return JSON.stringify(entry);
    }

    static deserializeAccessEntry(entry) {
        return JSON.parse(entry);
    }
}
