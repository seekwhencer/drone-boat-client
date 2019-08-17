import Module from './Module.js';
import Hostapd from './Hostapd/index.js';
import Dnsmasq from './Dnsmasq/index.js';
import Broker from './Broker/index.js';
import Api from './Api/index.js';

import Component from './Component/component.js';

export default class DroneBoat extends Module {

    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.label = 'DRONEBOAT';
            this.defaults = CONFIG.global;
            this.mergeOptions(args);
            LOG(this.label, 'INIT');

            new Hostapd()
                .then(accesspoint => {
                    global.ACCESSPOINT = accesspoint;
                    return new Dnsmasq();
                })
                .then(dnsmasq => {
                    global.DNS = dnsmasq;
                    return new Broker();
                })
                .then(broker => {
                    global.BROKER = broker;
                    return new Api();
                })
                .then(api => {
                    global.API = api;
                    return new Component({
                        type: 'Control',
                        item: 'Joystick',
                        options: 'widdow'
                    });
                })
                .then(joystick => {
                    global.JOYSTICK = joystick;
                    return new Component({
                        type: 'Gps',
                        options: 'mouse'
                    });
                })
                .then(gps => {
                    global.GPS = gps;
                })
        });
    }

};