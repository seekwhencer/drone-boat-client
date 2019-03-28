const
    Super = require('../super.js'),
    Server = require('../server');

module.exports = class Machine extends Super {

    constructor(args) {
        super(args);

        this.name = 'machine';
        this.label = 'MACHINE';

        this.server = new Server();

        LOG(this.label, 'INIT');
        this.mergeOptions();
    }

};