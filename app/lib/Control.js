import Module from './Module.js';
import Component from './Component/component.js';
import MqttClient from './MqttClient/index.js'

export default class extends Module {

    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.label = 'CONTROL';
            this.defaults = CONFIG.global;
            this.mergeOptions(args);
            LOG(this.label, 'INIT');

            new MqttClient()
                .then(mqttclient => {
                    global.MQTT = mqttclient;

                    return new Component({
                        type: 'Control',
                        item: 'Joystick',
                        options: 'widdow'
                    });
                })
                .then(joystick => {
                    global.JOYSTICK = joystick;
                });
        });
    }
}
