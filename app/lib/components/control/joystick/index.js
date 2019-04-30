const
    Control = require('../control.js'),
    spawn = require('child_process').spawn,
    Axis = require('./axis.js');
    Button = require('./button.js');
    Throttle = require('./throttle.js'),
    Yaw = require('./yaw.js');
    Pitch = require('./pitch.js');

module.exports = class Joystick extends Control {
    constructor(args) {
        super(args);

        this.name = 'joystick';
        this.label = 'JOYSTICK';

        LOG(this.label, 'INIT');
        this.mergeOptions();

        if (this.options.enabled === false)
            return this;

        this.proc = null;
        this.data = null;

        const Joystick = this;

        // axis mapping
        //
        // all axis
        for (let name in this.options.axis) {
            this[name] = new Axis(name, this.options.axis[name]);
            let axis = this[name];
            axis.on('change', (value, item) => {
                LOG('>>>', name, " : ", value);
            });
        }

        this.throttle = new Throttle(this.options.axis['throttle']);
        this.throttle.on('change', (value, throttle) => {
            Joystick.throttle.calculateSides();
            //Joystick.publish();
        });

        this.yaw = new Yaw(this.options.axis['yaw']);
        this.yaw.on('change', (value, yaw) => {
            Joystick.throttle.calculateSides();
            //Joystick.publish();
        });

        // buttons mapping
        //
        //
        for (let name in this.options.buttons) {
            this[name] = new Button(name, this.options.buttons[name]);
            this[name].on('change', (value, button) => {
                //LOG(this.label, button.name.toUpperCase(), button.value, "\r\r");
                const payload = {
                    name: button.name,
                    value: button.value
                };
                DRONEBOAT.broker.publish(`movement`, payload);
            });
        }

        if (this.options.autostart === true) {
            this.start();
        }
        LOG(this.label, '>>> READY');
    }

    start() {
        const processOptions = ['--normal', this.options.device];
        LOG(this.label, 'STARTING WITH OPTIONS', JSON.stringify(processOptions));

        this.proc = spawn(this.options.bin, processOptions);
        this.proc.stdout.setEncoding('utf8');
        this.proc.stdout.on('data', this.parseConsole.bind(this));
    }

    stop() {
        this.proc.kill();
    }

    parseConsole(chunk) {
        let a = chunk.split('Buttons:  ');
        const axisRaw = a[0].replace(/\rAxes:  |[0-9]:/gi, '').replace(/\s+/gi, ' ').trim();
        const buttonRaw = a[1].replace(/[0-9]:/gi, '').replace(/\s+/gi, ' ').trim();
        let axisData = axisRaw.split(' ');
        let buttonData = buttonRaw.split(' ');
        axisData = axisData.map(val => {
            return parseInt(val);
        });
        buttonData = buttonData.map(val => {
            if (val === 'on') return true;
            return false;
        });
        this.data = {
            axis: axisData,
            button: buttonData
        };
        for (let name in this.options.axis) {
            this[name].value = axisData[this[name].number];
        }
        for (let name in this.options.buttons) {
            this[name].value = buttonData[this[name].number];
        }
    }

    publish() {
        this.throttle.publish();
    }

};