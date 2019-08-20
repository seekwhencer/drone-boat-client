import Module from '../Module.js';
import mosca from 'mosca';
import redis from 'redis';

export default class extends Module {

    constructor(args) {
        super(args);
        return new Promise((resolve, reject) => {
            this.name = 'broker';
            this.label = 'BROKER';

            this.defaults = CONFIG.broker;

            LOG(this.label, 'INIT');
            this.mergeOptions(args);

            if (this.options.enabled === false) {
                resolve(false);
                return false;
            }

            this.storeSettings = {
                type: 'redis',
                redis: redis,
                db: 12,
                port: 6379,
                return_buffers: true,
                host: "localhost"
            };

            this.settings = {
                port: parseInt(this.options.port),
                backend: this.storeSettings,
                persistence: {
                    factory: mosca.persistence.Redis
                }
            };

            this.engine = new mosca.Server(this.settings);

            this.engine.on('clientConnected', (client) => {
                LOG(this.label, 'client connected:', client.id);
            });

            this.engine.on('published', (packet, client) => {
                if (!client)
                    return;

                LOG(this.label, 'GOT DATA FROM: >', client.id, '<  TOPIC >', packet.topic,'<  ',packet.payload.toString());
            });

            LOG('');
            LOG(this.label, '>>> READY');
            LOG('');
            resolve(this);
        });
    }

    publish(topic, payload) {
        const broker = this;
        let _payload = Buffer.from(JSON.stringify(payload));

        this.engine.publish({
            topic: topic,
            payload: _payload,
            qos: 1
        }, null, () => {
            LOG(broker.label, 'PUBLISHING ON TOPIC', topic, 'PAYLOAD', JSON.stringify(payload));
        });
    }

};