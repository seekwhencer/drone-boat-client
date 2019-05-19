const
    mosca = require('mosca'),
    Super = require('../super.js'),
    redis = require('redis');

module.exports = class Broker extends Super {

    constructor(args) {
        super(args);

        this.name = 'broker';
        this.label = 'BROKER';
        LOG(this.label, 'INIT');
        this.mergeOptions();

        if (this.options.enabled === false)
            return this;

        this.storeSettings = {
            type: 'redis',
            redis: redis,
            db: 12,
            port: 6379,
            return_buffers: true, // to handle binary payloads
            host: "localhost"
        };

        this.settings = {
            port: 9090,
            backend: this.storeSettings,
            persistence: {
                factory: mosca.persistence.Redis
            }
        };

        this.engine = new mosca.Server(this.settings);

        this.engine.on('clientConnected', function (client) {
            LOG(this.label, 'client connected:', client.id);
        }.bind(this));

        this.engine.on('published', function (packet, client) {
            if (!client)
                return;

            LOG(this.label, 'Published from:', client.id, packet.payload.toString());
        }.bind(this));

    }

    publish(topic, payload) {
        let broker = this;
        let _payload = Buffer.from(JSON.stringify(payload));

        this.engine.publish({
            topic: topic,
            payload: _payload,
            qos: 1
        }, null, function done() {
            LOG(this.label, 'PUBLISHING ON TOPIC', topic, 'PAYLOAD', JSON.stringify(payload));
        }.bind(broker));
    }

};