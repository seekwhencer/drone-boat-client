import Module from '../../Module.js';
import Gps from 'gps';
import SerialPort from 'serialport';
import Readline from '@serialport/parser-readline';

export default class extends Module {
    constructor(args) {
        super(args);
        this.label = 'GPS';

        LOG(this.label, 'INIT');
        this.defaults = CONFIG.gps;
        this.mergeOptions(args);

        this.lat = false;
        this.lon = false;
        this.time = false;
        this.speed = false;

        this.gps = new Gps();
        this.gps.on('data', () => {
            this.mapState();
        });

        this.port = new SerialPort(this.options.device, {
            baudRate: this.options.baudrate
        });
        this.parser = new Readline();
        this.port.pipe(this.parser);
        this.parser.on('data', line => {
            this.gps.update(line);
        });
    }

    mapState() {
        this.lat = this.gps.state.lat;
        this.lon = this.gps.state.lon;
        this.time = this.gps.state.time;
        this.speed = this.gps.state.speed;
        this.publish();
    }

    publish(){
        const payload = {
            lat: this.lat,
            lon: this.lon,
            time: this.time,
            speed: this.speed
        };
        BROKER.publish(`gps`, payload);
    }
};