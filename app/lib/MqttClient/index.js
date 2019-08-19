import Module from '../Module.js';
import mqtt from 'mqtt';

export default class extends Module {
    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.label = 'MQTT CLIENT';
            this.defaults = CONFIG.mqttclient;
            LOG(this.label, 'INIT');
            this.mergeOptions(args);

            this.subscriptions = [];

            this.on('ready', () => {
                resolve(this);
            });
            this.on('message', (topic, message, packet) => {
                LOG(this.label, 'RECEIVED', topic, message);
            });

            this.client = mqtt.connect({
                host: this.options.host,
                port: parseInt(this.options.port),
                clientId: CONFIG.global.name,
                keepalive: 1,
                clean: false,
                reconnectPeriod: 1000 * 1
            });

            this.client.on('connect', () => {
                LOG(this.label, 'connected');
                this.emit('ready');
            });

            this.client.on('message', (topic, message, packet) => {
                message = message.toString();
                topic = topic.toString();
                this.emit('message', topic, message, packet);
            });
        });
    }

    subscribe(topic) {
        if (this.subscriptions.includes(topic))
            return false;

        LOG(this.label, 'SUBSCRIBING', topic);
        this.subscriptions.push(topic);
        this.client.subscribe(topic);
    }

    unsubscribe(topic) {
        if (!this.subscriptions.includes(topic))
            return false;

        LOG(this.label, 'UNSUBSCRIBE', topic);
        this.subscriptions = this.subscriptions.filter(i => i !== topic);
        this.client.unsubscribe(topic);
    }

    publish(topic, payload) {
        if (this.options.tty === true)
            LOG(this.label, 'PUBLISHING', topic, JSON.stringify(payload));

        let _payload = Buffer.from(JSON.stringify(payload));
        this.client.publish(topic, _payload);
    }
}