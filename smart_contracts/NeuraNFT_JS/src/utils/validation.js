// utils/validation.js
import { near } from "near-sdk-js";
import { AccessLevel } from "../models";

export class Validation {
    static isValidAccountId(accountId) {
        return /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/.test(accountId);
    }

    static isValidOwnershipLevel(level) {
        return level > 0 && level <= 6;
    }

    static validateMetadata(metadata) {
        const requiredFields = ['title', 'description', 'media'];
        for (const field of requiredFields) {
            if (!metadata[field]) {
                near.panicUtf8(`Missing required field: ${field}`);
            }
        }
        return true;
    }

    static validateCollectionMetadata(metadata) {
        const requiredFields = ['name', 'contextWindow', 'baseModel'];
        for (const field of requiredFields) {
            if (!metadata[field]) {
                near.panicUtf8(`Missing required field: ${field}`);
            }
        }
        return true;
    }
}