import Axis from './axis.js';

export default class extends Axis {
    constructor(_options) {
        super(false, _options);
        this.name = 'pitch';
    }
};