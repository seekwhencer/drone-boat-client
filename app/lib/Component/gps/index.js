import Module from '../../Module.js';

export default class extends Module {
    constructor(args) {
        super(args);
        this.label = 'GPS';

        LOG(this.label, 'INIT');
        this.defaults = CONFIG.gps;
        this.mergeOptions(args);
    }
};