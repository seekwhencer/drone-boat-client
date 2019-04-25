const
    Control = require('./control'),
    spawn = require('child_process').spawn,
    Event = require('events');

module.exports = class Joystick extends Control {
    constructor(args) {
        super(args);

        this.name = 'joystick';
        this.label = 'JOYSTICK';

        LOG(this.label, 'INIT');
        this.mergeOptions();

        this.proc = null;
        this.data = null;

        // axis mapping
        for (let name in this.options.axis) {
            this[name] = new Axis(name, this.options.axis[name]);
            this[name].on('change', (value) => {
                LOG(this.label, name.toUpperCase(), value, "\r\r");
            });
        }
        // buttons mapping
        for (let name in this.options.buttons) {
            this[name] = new Button(name, this.options.buttons[name]);
            this[name].on('change', (value) => {
                LOG(this.label, name.toUpperCase(), value, "\r\r");
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
            this[name].value = axisData[this[name].num];
        }
        for (let name in this.options.buttons) {
            this[name].value = buttonData[this[name].num];
        }
    };
};


/**
 *
 *
 */
class Abstract {
    constructor(name, num) {
        this.event = new Event();
        this.name = name;
        this.value = 0;
        this.num = num;
    }

    on() {
        this.event.on.apply(this.event, Array.from(arguments));
    }

    emit() {
        this.event.emit.apply(this.event, Array.from(arguments));
    }

    set value(val) {
        if (this._value === val) {
            return;
        }
        this._value = val;
        this.emit('change', val);
    }

    get value() {
        return this._value;
    }

    set name(name) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    set num(num) {
        this._num = num;
    }

    get num() {
        return this._num;
    }
}

class Axis extends Abstract {
    constructor(name, num) {
        super(name, num);
    }
}

class Button extends Abstract {
    constructor(name, num) {
        super(name, num);
    }
}