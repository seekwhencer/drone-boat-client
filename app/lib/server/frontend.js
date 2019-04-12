const
    Super = require('../super');

module.exports = class Frontend extends Super {

    constructor(args) {
        super(args);

        this.name = 'frontend';
        this.label = 'FRONTEND';

        LOG(this.label, 'INIT');
        this.mergeOptions();

        APP.use('/', EXPRESS.static(`${APP_DIR}/public`));
        LOG(this.label, 'READY');
    }

};