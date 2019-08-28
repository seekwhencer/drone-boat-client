import Abstract from './abstract.js';

export default class extends Abstract {
    constructor(name, _options) {
        super(name, _options);
    }

    publish() {
        const payload = {
            name: this.name,
            value: this.value
        };
        try {
            MQTT.publish(`joystick/buttons`, payload);
        } catch (error) {
            LOG(error);
        }
    }
};