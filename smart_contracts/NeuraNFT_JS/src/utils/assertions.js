import { near } from "near-sdk-js";
import { AccessLevel } from "../models";

// utils/assertions.js
// import { near } from "near-sdk-js";

export class Assertions {
    static assert(condition, message) {
        if (!condition) {
            near.panicUtf8(message);
        }
    }

    static assertOneYocto() {
        if (near.attachedDeposit().toString() !== "1") {
            near.panicUtf8("Requires attached deposit of exactly 1 yoctoNEAR");
        }
    }

    static assertAtLeastOneYocto() {
        if (near.attachedDeposit().toString() === "0") {
            near.panicUtf8("Requires attached deposit of at least 1 yoctoNEAR");
        }
    }

    static assertOwner(contractOwner) {
        if (near.predecessorAccountId() !== contractOwner) {
            near.panicUtf8("Only contract owner can call this method");
        }
    }
}