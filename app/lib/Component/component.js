import Module from '../Module.js';
import Components from './index.js'

export default class extends Module {
    constructor(args) {
        super(args);
        return new Promise((resolve, reject) => {
            this.label = 'COMPONENT';
            LOG(this.label, '>>> INIT', args);

            this.types = [];
            this.getTypes();
            this.type = args.type;

            this.items = [];
            this.getItems();
            this.item = args.item;

            args.options = args.options || false;

            // if the type is not the item
            if (Components[this.type][this.item]) {
                const options = CONFIG[this.item.toLowerCase()];
                resolve(new Components[this.type][this.item](options));
                return;
            }

            // if the type is the item
            if (Components[this.type]) {
                const options = CONFIG[this.type.toLowerCase()];
                resolve(new Components[this.type](options));
                return;
            }
            resolve(false);
        });
    }

    getTypes() {
        this.types = Object.keys(Components);
    }

    getItems() {
        this.items = Object.keys(Components[this.type]);
    }

    set type(value) {
        if (!this.types.includes(value)) {
            this._type = false;
            return;
        }
        this._type = value;
    }

    get type() {
        return this._type;
    }

    set item(value) {
        if (!this.items.includes(value)) {
            this._item = false;
            return;
        }
        this._item = value;
    }

    get item() {
        return this._item;
    }

};