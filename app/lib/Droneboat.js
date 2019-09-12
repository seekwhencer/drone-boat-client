import Module from './Module.js';
import Broker from './Broker/index.js';
import Api from './Api/index.js';
import MqttClient from './MqttClient/index.js';

import Component from './Component/component.js';

export default class DroneBoat extends Module {

    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.label = 'DRONEBOAT';
            this.defaults = CONFIG.global;
            this.mergeOptions(args);
            LOG(this.label, 'INIT');

            return new Broker()
                .then(broker => {
                    global.BROKER = broker;
                    return new MqttClient();
                })
                .then(mqttclient => {
                    global.MQTT = mqttclient;
                    return new Api();
                })
                .then(api => {
                    global.API = api;
                    return new Component({
                        type: 'Gps',
                        options: 'mouse'
                    });
                })
                .then(gps => {
                    global.GPS = gps;
                    resolve(this);
                })
        });
    }

};