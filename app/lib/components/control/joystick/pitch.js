const Axis = require('./axis.js');

module.exports = class Pitch extends Axis {
    constructor(_options) {
        super(false, _options);
        this.name = 'pitch';
    }
};