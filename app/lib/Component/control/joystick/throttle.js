import Axis from './axis.js';

export default class extends Axis {
    constructor(options) {
        super('throttle', options);
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
//        if (!JOYSTICK)
//            return;

        let yaw = JOYSTICK.yaw;
        let source = this.normalized;

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
            BROKER.publish(`movement`, payload);
        } catch (error) {
            LOG(error);
        }

    }
};