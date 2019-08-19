import Module from '../../Module.js';
import Gps from 'gps';
import SerialPort from 'serialport';
import Readline from '@serialport/parser-readline';
import {spawn} from 'child_process';

export default class extends Module {
    constructor(args) {
        super(args);
        this.label = 'GPS';

        LOG(this.label, 'INIT');
        this.defaults = CONFIG.gps;
        this.mergeOptions(args);

        this.process = {
            baudrate: false
        };

        this.lat = false;
        this.lon = false;
        this.time = false;
        this.timestamp = false;
        this.speed = false;
        this.system_time_set = false;

        this.setBaudrate();

        this.gps = new Gps();
        this.gps.on('data', () => {
            this.mapState();
        });

        this.port = new SerialPort(this.options.device, {
            baudRate: parseInt(this.options.baudrate)
        });
        this.parser = new Readline();
        this.port.pipe(this.parser);
        this.parser.on('data', line => {
            try {
                this.gps.update(line);
            } catch (e) {}
        });
    }

    mapState() {
        const date = new Date(this.gps.state.time);

        this.milliseconds = `${Date.parse(this.gps.state.time)}`.slice(-4);
        this.time = date.toLocaleString();
        this.timestamp = Date.parse(this.time);
        this.lat = this.gps.state.lat;
        this.lon = this.gps.state.lon;
        this.speed = this.gps.state.speed;
        this.publish();

        if (!this.system_time_set) {
            this.setSystemTime();
        }
    }

    publish() {
        const payload = {
            lat: this.lat,
            lon: this.lon,
            time: this.time,
            timestamp: this.timestamp,
            milliseconds: this.milliseconds,
            speed: this.speed
        };

        if (JSON.stringify(this.payload) === JSON.stringify(payload))
            return false;

        this.payload = payload;
        MQTT.publish(`gps`, this.payload);
    }

    setSystemTime() {
        if (this.timestamp === 'NaN')
            return false;

        this.system_time_set = true;
        setTimeout(() => {
            const processOptions = ['-s', this.time];
            LOG(this.label, 'SET SYSTEM DATE AND TIME WITH OPTIONS', this.timestamp, JSON.stringify(processOptions));
            spawn('/bin/date', processOptions);
        }, 1000);
    }

    setBaudrate() {
        const processOptions = ['-F', this.options.device, 'ispeed', this.options.baudrate];
        LOG(this.label, 'SET BAUDRATE', JSON.stringify(processOptions));
        this.process.baudrate = spawn('/bin/stty', processOptions);
        this.process.baudrate.stdout.setEncoding('utf8');
        this.process.baudrate.stdout.on('data', chunk => {
            if (this.options.tty === true) {
                LOG(this.label, 'TTY BAUDRATE', chunk.toString().trim());
            }
        });
    }
};