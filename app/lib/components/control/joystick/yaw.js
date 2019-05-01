const Axis = require('./axis.js');

module.exports = class Yaw extends Axis {
    constructor(_options) {
        super(false, _options);
        this.name = 'yaw';
        this.normalized = 0;
    }
};