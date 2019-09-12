import Module from '../Module.js';
import mosca from 'mosca';
import redis from 'redis';
import http from 'http';

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
                host: "0.0.0.0"
            };

            this.settings = {
                host: '0.0.0.0',
                port: parseInt(this.options.port),
                backend: this.storeSettings,
                persistence: {
                    factory: mosca.persistence.Redis
                }
            };

            this.server = http.createServer();
            this.engine = new mosca.Server(this.settings);
            this.engine.attachHttpServer(this.server);

            this.server.listen(this.options.ws_port, () => {
                LOG(this.label, 'WS SERVER IS UP ON PORT:', this.options.ws_port);
            });

            this.engine.on('clientConnected', (client) => {
                LOG(this.label, 'CLIENT CONNECTED:', client.id);
                try{
                    MQTT.publish('network', {
                        clientId: client.id,
                        state: 'connected',
                        timestamp: parseInt(Date.now() / 1000)
                    });
                }catch(e){}
            });

            this.engine.on('clientDisconnected', (client) => {
                LOG(this.label, 'CLIENT DISCONNECTED:', client.id);
                try{
                    MQTT.publish('network', {
                        clientId: client.id,
                        state: 'disconnected',
                        timestamp: parseInt(Date.now() / 1000)
                    });
                }catch(e){}
            });

            this.engine.on('published', (packet, client) => {
                if (!client)
                    return;

                // link here the influx database
                INFLUX.message(packet.topic, packet.payload, client.id);

                if (this.options.tty === true)
                    LOG(this.label, 'GOT DATA FROM: >', client.id, '<  TOPIC >', packet.topic, '<  ', packet.payload.toString());
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