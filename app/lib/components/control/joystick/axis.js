const Abstract = require('./abstract.js');

module.exports = class Axis extends Abstract {
    constructor(name, _options) {
        super(name, _options);
        this.normalized = 0;
        this.eased = 0;
        this.easer = false;
        this.normalize();
    }

    set normalized(value) {
        this._normalized = value;
    }

    get normalized() {
        return this._normalized;
    }

    set eased(value) {
        this._eased = value;
    }

    get eased() {
        return this._eased;
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
        this.ease();
    }

    scaleNumberRange(number, oldMin, oldMax, newMin, newMax) {
        return (((newMax - newMin) * (number - oldMin)) / (oldMax - oldMin)) + newMin;
    }

    ease() {
        if (!this.options.duty_time)
            return;

        if (this.easer) {
            clearTimeout(this.easer);
        }

        if (this.normalized === 0) {
            this.eased = 0;
        }

        this.publish();

        //LOG(this.name, 'TICK', this.normalized, this.eased);

        let axis = this;
        if (axis.eased === axis.normalized) {
            return;
        }

        this.easer = setTimeout(() => {
            if (axis.normalized > 0) {
                if (axis.eased < axis.normalized) {
                    axis.eased = axis.eased + axis.options.duty_value;
                    axis.ease();
                }
                if (axis.eased > axis.normalized) {
                    axis.eased = axis.eased - axis.options.duty_value;
                    axis.ease();
                }
            }

            if (axis.normalized < 0) {
                if (axis.eased > axis.normalized) {
                    axis.eased = axis.eased - axis.options.duty_value;
                    axis.ease();
                }
                if (axis.eased < axis.normalized) {
                    axis.eased = axis.eased + axis.options.duty_value;
                    axis.ease();
                }
            }

            if (axis.calculateSides)
                axis.calculateSides();

        }, axis.options.duty_time);
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
            DRONEBOAT.broker.publish(`movement`, payload);
        } catch (error) {
            LOG(error);
        }

    }
};