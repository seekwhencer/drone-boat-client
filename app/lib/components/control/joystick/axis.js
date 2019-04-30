const Abstract = require('./abstract.js');

module.exports = class Axis extends Abstract {
    constructor(name, _options) {
        super(name, _options);
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
            this.normalized = parseInt(this.scaleNumberRange(this.value, opts.in.min, opts.in.max, opts.out.min, opts.out.max));
        }
    }
    scaleNumberRange(number, oldMin, oldMax, newMin, newMax) {
        return (((newMax - newMin) * (number - oldMin)) / (oldMax - oldMin)) + newMin;
    }


};