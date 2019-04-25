const
    Super = require('./super.js'),
    Server = require('./server'),
    DnsMasq = require('./dnsmasq'),
    Hostapd = require('./hostapd'),
    Broker = require('./broker'),
    Joystick = require('./components/control/blackwidow.js');

module.exports = class DroneBoat extends Super {

    constructor(args) {
        super(args);

        this.name = 'droneboat';
        this.label = 'DRONEBOAT';

        this.accesspoint = new Hostapd();
        this.dns = new DnsMasq();
        this.broker = new Broker();
        this.server = new Server();
        this.joystick = new Joystick();

        LOG(this.label, 'INIT');
        this.mergeOptions();
    }

};