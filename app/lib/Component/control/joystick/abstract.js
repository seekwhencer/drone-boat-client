import {EventEmitter} from 'events';

export default class {
    constructor(name, options) {
        this.event = new EventEmitter();
        this.name = name;
        this.options = options;
        this.number = parseInt(this.options.number);
        this.value = parseInt(this.options.default);
    }

    on() {
        this.event.on.apply(this.event, Array.from(arguments));
    }

    emit() {
        this.event.emit.apply(this.event, Array.from(arguments));
    }

    set value(val) {
        if (this._value === val) {
            return;
        }
        this._value = val;
        this.emit('change', val, this);
    }

    get value() {
        return this._value;
    }

    set name(name) {
        this._name = name;
    }

    get name() {
        return this._name;
    }


    set number(number) {
        this._number = number;
    }

    get number() {
        return this._number;
    }

    set options(options) {
        this._options = options;
    }

    get options() {
        return this._options;
    }
}
