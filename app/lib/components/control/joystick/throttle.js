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

        this.left = this.normalized;
        this.right = this.normalized;

        if (this.normalized > 0) {
            yaw.options.out.min = this.normalized * -1;
            yaw.options.out.max = this.normalized;

            if (yaw.normalized > 0) {
                this.left = this.normalized - yaw.normalized;
            }

            if (yaw.normalized < 0) {
                this.right = this.normalized - (yaw.normalized * -1);
            }
        }

        if (this.normalized < 0) {
            yaw.options.out.min = this.normalized;
            yaw.options.out.max = this.normalized * -1;

            if (yaw.normalized > 0) {
                this.left = this.normalized + yaw.normalized;
            }
            if (yaw.normalized < 0) {
                this.right = this.normalized + (yaw.normalized * -1);
            }
        }

        LOG('>>!!', this.name, 'YAW:', yaw.normalized, typeof yaw.normalized, 'THROTTLE:', this.normalized, 'LEFT:', this.left, 'RIGHT:', this.right);
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
        DRONEBOAT.broker.publish(`movement`, payload);
    }


};