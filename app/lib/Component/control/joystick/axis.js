import Abstract from './abstract.js';

export default class extends Abstract {
    constructor(name, options) {
        super(name, options);
        this.normalized = 0;
        this.normalize();
    }

    set normalized(value) {
        this._normalized = value;
    }

    get normalized() {
        return this._normalized;
    }

    set value(val) {
        if (this._value === val) {
            return;
        }
        this._value = val;
        this.normalize();
        this.emit('change', val, this);
    }

    get value() {
        return this._value;
    }

    normalize() {
        const opts = this.options;
        if (opts.in && opts.out) {
            this.normalized = parseInt(this.scaleNumberRange(this.value, parseInt(opts.in.min), parseInt(opts.in.max), parseInt(opts.out.min), parseInt(opts.out.max)));
        }
    }

    scaleNumberRange(number, oldMin, oldMax, newMin, newMax) {
        return (((newMax - newMin) * (number - oldMin)) / (oldMax - oldMin)) + newMin;
    }

    publish() {
        const payload = {
            name: this.name,
            value: this.normalized,
            side: {
                left: this.left,
                right: this.right,
            }
        };
        try {
            MQTT.publish(`movement`, payload);
        } catch (error) {
            LOG(error);
        }

    }
};