// standards/nep_implementation.js
import { NEP171 } from './nep171';
import { NEP177 } from './nep177';
import { NEP181 } from './nep181';

export class NFTStandards {
    constructor(core) {
        this.nep171 = new NEP171();
        this.nep177 = new NEP177();
        this.nep181 = new NEP181();
        this.core = core;
    }

    init() {
        // Initialize standards implementation
        Object.assign(this, this.nep171);
        Object.assign(this, this.nep177);
        Object.assign(this, this.nep181);
    }
}