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

        this.raw = null;
        this.data = null;

        this.yaw = new Axis('yaw');
        this.pitch = new Axis('pitch');
        this.throttle = new Axis('throttle');
        this.fire = new Button('fire');
        this.fire_alt = new Button('fire_alt');

        this.yaw.on('change', (value) => {
            LOG(' YAW:', value, '\r');
        });
        this.pitch.on('change', (value) => {
            LOG(' PITCH:', value, '\r');
        });
        this.throttle.on('change', (value) => {
            LOG(' THROTTLE:', value, '\r');
        });
        this.fire.on('change', (value) => {
            LOG(' FIRE:', value, '\r');
        });
        this.fire_alt.on('change', (value) => {
            LOG(' FIRE ALT:', value, '\r');
        });

        this.proc = false;

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
        const state_map = {
            'on': true,
            'off': false
        };
        chunk = chunk
            .replace(/\rAxes:  |Buttons:  |0:|1:|2:|3:|4:|5:|6:|7:/gi, '')
            .replace(/  /gi, ' ');

        let arr = chunk.split(' ');

        if (arr[0] === 'Driver') // the first keyword in the inital console print from jstest
            return;

        arr = arr.filter(function (i) {
            if (i != '') {
                return true;
            }
        });
        this.raw = arr;
        this.data = {
            axis: {
                yaw: parseInt(arr[0]),
                pitch: parseInt(arr[1]),
                throttle: parseInt(arr[2])
            },
            button: {
                f1: state_map[arr[6]],
                f2: state_map[arr[7]],
                f3: state_map[arr[8]],
                f4: state_map[arr[9]],
                f5: state_map[arr[10]],
                f6: state_map[arr[11]],
                f7: state_map[arr[12]],
                f8: state_map[arr[13]]
            }
        };

        this.yaw.value = arr[0];
        this.pitch.value = arr[1];
        this.throttle.value = arr[2];
        this.fire.value = state_map[arr[6]];
        this.fire_alt.value = state_map[arr[7]];
    };
};


/**
 *
 *
 */
class Abstract {
    constructor(axis) {
        this.event = new Event();
        this.name = axis;
        this.value = 0;
    }
    on() {
        this.event.on.apply(this.event, Array.from(arguments));
    }
    emit() {
        this.event.emit.apply(this.event, Array.from(arguments));
    }
    set value(val) {
        if(this._value === val){
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
}

class Axis extends Abstract {
    constructor(args) {
        super(args);
    }
}

class Button extends Abstract {
    constructor(args) {
        super(args);
    }
}