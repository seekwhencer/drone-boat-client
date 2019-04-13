const
    mosca = require('mosca'),
    Super = require('../super.js');


module.exports = class Broker extends Super {

    constructor(args) {
        super(args);

        this.name = 'broker';
        this.label = 'BROKER';
        LOG(this.label, 'INIT');
        this.mergeOptions();

        this.storeSettings = {
            type: 'redis',
            redis: require('redis'),
            db: 12,
            port: 6379,
            return_buffers: true, // to handle binary payloads
            host: "localhost"
        };

        this.storeSettings = {
            port: 9090,
            backend: this.storeSettings,
            persistence: {
                factory: mosca.persistence.Redis
            }
        };

        this.engine = new mosca.Server(this.settings);

    }

};