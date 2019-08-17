import Axis from './axis.js';

export default class extends Axis {
    constructor(options) {
        super('yaw', options);
        this.name = 'yaw';
        this.normalized = 0;
    }
};