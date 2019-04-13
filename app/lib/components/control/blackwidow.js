const
    Joystick = require('./joystick');

module.exports = class BlackWidow extends Joystick {
    constructor(args){
        super(args);

        this.name = 'blackwidow';
        this.label = 'BLACK WIDOW JOYSTICK';

        LOG(this.label, 'INIT');
    }
};