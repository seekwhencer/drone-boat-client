const Axis = require('./axis.js');

module.exports = class Throttle extends Axis {
    constructor(_options) {
        super('throttle', _options);
        this.name = 'throttle';
        this.left = 0;
        this.right = 0;
    }

    set left(left) {
        this._left = left;
    }

    get left() {
        return this._left;
    }

    set right(right) {
        this._right = right;
    }

    get right() {
        return this._right;
    }

    calculateSides() {
        if (!DRONEBOAT)
            return;

        let yaw = DRONEBOAT.joystick.yaw;
        let source = this.normalized;

        if (this.options.duty_time) {
            source = this.eased;
        }

        this.left = source;
        this.right = source;

        if (source > 0) {
            yaw.options.out.min = source * -1;
            yaw.options.out.max = source;
            if (yaw.normalized > 0) {
                this.left = source - yaw.normalized;
            }
            if (yaw.normalized < 0) {
                this.right = source - (yaw.normalized * -1);
            }
        }

        if (source < 0) {
            yaw.options.out.min = source;
            yaw.options.out.max = source * -1;
            if (yaw.normalized > 0) {
                this.left = source + yaw.normalized;
            }
            if (yaw.normalized < 0) {
                this.right = source + (yaw.normalized * -1);
            }
        }
        //LOG('>>!!', this.name, 'YAW:', yaw.normalized, typeof yaw.normalized, 'THROTTLE:', this.normalized, 'EASED', this.eased, 'LEFT:', this.left, 'RIGHT:', this.right);
    }

    publish() {
        const payload = {
            name: this.name,
            value: this.normalized,
            eased: this.eased,
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