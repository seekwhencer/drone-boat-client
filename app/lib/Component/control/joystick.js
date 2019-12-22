import Module from '../../Module.js';
import {spawn} from 'child_process';

import Button from './joystick/button.js';
import Throttle from './joystick/throttle.js';
import Yaw from './joystick/yaw.js';
import * as R from '../../Ramda.js';

export default class Joystick extends Module {
    constructor(args) {
        super(args);
        this.label = 'JOYSTICK';

        LOG(this.label, 'INIT');
        this.defaults = CONFIG.joystick;
        this.mergeOptions(args);

        if (this.options.enabled === false)
            return this;

        this.proc = null;
        this.data = null;

        // speed / throttle
        this.throttle = new Throttle(this.options.axis.throttle);
        this.throttle.on('change', (value, throttle) => {
            this.throttle.calculateSides();
            this.throttle.publish();
        });

        // left / right
        this.yaw = new Yaw(this.options.axis.yaw);
        this.yaw.on('change', (value, yaw) => {
            this.throttle.calculateSides();
            this.throttle.publish();
        });

        // buttons mapping
        /*for (let name in this.options.buttons) {
            this[name] = new Button(name, this.options.buttons[name]);
            this[name].on('change', (value, button) => {
                //LOG(this.label, button.name.toUpperCase(), button.value, "\r\r");
                this.button[name].publish();
            });
        }*/

        this.button7 = new Button('button7', this.options.buttons.button7);
        this.button7.on('change', (value, button) => {
            try {
                if (value === false) {
                    this.throttle.value = 0;
                }
                this.throttle.calculateSides();
                this.throttle.publish();
                this.button7.publish();
            } catch (e) {
                //..
            }
        });

        this.button1 = new Button('button1', this.options.buttons.button1);
        this.button1.on('change', (value, button) => {
            this.throttle.calculateSides();
            this.throttle.publish();
            this.button1.publish();
        });

        if (this.options.autostart === true) {
            this.start();
        }
        LOG(this.label, '>>> READY');
    }

    mergeOptions(args) {
        super.mergeOptions(args);
        if (this.options.config && CONFIG.joystick[this.options.config]) {
            this.options = R.merge(this.options, CONFIG.joystick[this.options.config]);
        }
    }

    start() {
        const processOptions = ['--normal', this.options.device];
        LOG(this.label, 'STARTING WITH OPTIONS', JSON.stringify(processOptions));

        this.proc = spawn(this.options.bin, processOptions);
        this.proc.stdout.setEncoding('utf8');
        this.proc.stdout.on('data', chunk => {
            this.parseConsole(chunk);
        });
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
            if (val === 'on')
                return true;

            return false;
        });
        this.data = {
            axis: axisData,
            button: buttonData
        };
        for (let name in this.options.axis) {
            if (this[name])
                this[name].value = axisData[this[name].number];
        }
        for (let name in this.options.buttons) {
            if (this[name])
                this[name].value = buttonData[this[name].number];
        }
    }

    publish() {
        this.throttle.publish();
    }
}
