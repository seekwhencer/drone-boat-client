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

        if (this.options.enabled === false)
            return this;

        this.proc = null;
        this.data = null;

        // axis mapping
        for (let name in this.options.axis) {
            this[name] = new Axis(name, this.options.axis[name]);
            this[name].on('change', (value, axis) => {
                //LOG(this.label, name.toUpperCase(), value, "\r\r");
                const payload = {
                    name: axis.name,
                    value: axis.calculated
                };
                DRONEBOAT.broker.publish(`movement`, payload);
            });
        }
        // buttons mapping
        for (let name in this.options.buttons) {
            this[name] = new Button(name, this.options.buttons[name]);
            this[name].on('change', (value, button) => {
                //LOG(this.label, button.name.toUpperCase(), button.value, "\r\r");
                const payload = {
                    name: button.name,
                    value: button.calculated
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
    };
};


/**
 *
 *
 */
class Abstract {
    constructor(name, _options) {
        this.event = new Event();
        this.name = name;
        this.options = _options;
        this.number = this.options.number;
        this.value = this.options.default;
        this.calculated = 0;
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
        this.calculate();
        this.emit('change', val, this);
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

    set calculated(value) {
        this._calculated = value;
    }

    get calculated() {
        return this._calculated;
    }

    set number(number) {
        this._number = number;
    }

    get number() {
        return this._number;
    }

    set options(options) {
        this._options = options;
    }

    get options() {
        return this._options;
    }

    calculate() {
        const opts = this.options;
        if (opts.in && opts.out) {
            this.calculated = parseInt(this.scaleNumberRange(this.value, opts.in.min, opts.in.max, opts.out.min, opts.out.max));
        }
    }

    scaleNumberRange(number, oldMin, oldMax, newMin, newMax) {
        return (((newMax - newMin) * (number - oldMin)) / (oldMax - oldMin)) + newMin;
    }
}

class Axis extends Abstract {
    constructor(name, _options) {
        super(name, _options);
    }
}

class Button extends Abstract {
    constructor(name, _options) {
        super(name, _options);
    }
    calculate(){
        this.calculated = this.value;
    }
}