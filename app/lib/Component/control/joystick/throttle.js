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
        if (JOYSTICK.button7.value !== true) {
            this.value = 0;
            this.left = 0;
            this.right = 0;
            return;
        }

        let yaw = JOYSTICK.yaw;
        let source = this.normalized;

        this.left = source;
        this.right = source;

        let percent = yaw.normalized / 100;

        // left
        if (percent > 0) {
            percent = 1 - percent;
            this.left = parseInt(this.right * percent);

        }
        // right
        if (percent < 0) {
            percent = 1 + percent;
            this.right = parseInt((this.left * percent));
        }

        // flip the other side with same throttle to rotate on place
        if (JOYSTICK.button1.value === true) {
            if (source > 0) {
                if (this.right > this.left) {
                    this.left = this.right * -1;
                }
                if (this.left > this.right) {
                    this.right = this.left * -1;
                }
            }
            if (source < 0) {
                if (this.right < this.left) {
                    this.left = this.right * -1;
                }
                if (this.left < this.right) {
                    this.right = this.left * -1;
                }
            }
        }

        // flip backwards
        /*if (source < 0) {
            const r = this.right;
            const l = this.left;
            this.right = l;
            this.left = r;
        }*/

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
            MQTT.publish(`movement`, payload);
        } catch (error) {
            LOG(error);
        }
    }


};