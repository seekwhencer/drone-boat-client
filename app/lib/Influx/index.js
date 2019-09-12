import Module from '../Module.js';
import influx from 'influx';

export default class extends Module {
    constructor(args) {
        super(args);
        return new Promise((resolve, reject) => {
            this.label = 'INFLUX CLIENT';
            this.defaults = CONFIG.influxdb;
            LOG(this.label, 'INIT');
            this.mergeOptions(args);

            this.client = new influx.InfluxDB({
                host: this.options.host,
                port: this.options.port,
                database: this.options.database
            });

            LOG('');
            LOG(this.label, '>>> READY');
            LOG('');
            resolve(this);
        });
    };

    message(topic, payload, clientId) {
        payload = JSON.parse(payload.toString());

        let point = {
            measurement: topic,
            tags: {

            },
            fields: {
                clientId: clientId,
                ...payload
            },
            timestamp: Date.now() * 1000 * 1000
        };

        this.client
            .writePoints([
                point
            ])
            .then(() => {
                if(this.options.tty === true)
                    LOG(this.label, 'WRITE DATA' + JSON.stringify(point));
            })
            .catch((error) => {
                LOG(this.label, error);
            });
    }
};