const
    Super = require('../super.js'),
    Server = require('../server'),
    DnsMasq = require('../dnsmasq'),
    Hostapd = require('../hostapd'),
    Joystick = require('../components/control/blackwidow.js');

module.exports = class Machine extends Super {

    constructor(args) {
        super(args);

        this.name = 'machine';
        this.label = 'MACHINE';

        this.accesspoint = new Hostapd();
        this.dns = new DnsMasq();
        this.joystick = new Joystick();

        this.server = new Server();

        LOG(this.label, 'INIT');
        this.mergeOptions();
    }

};