import Module from './Module.js';
import Hostapd from './Hostapd/index.js';
import Dnsmasq from './Dnsmasq/index.js';

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
                });
        });
    }

};