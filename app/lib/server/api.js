const
    Super = require('../super'),
    fs = require('fs-extra');

module.exports = class Api extends Super {

    constructor(args) {
        super(args);

        this.name = 'api';
        this.label = 'API';

        LOG(this.label, 'INIT');
        this.mergeOptions();

        if (this.options.enabled === false)
            return this;

        this.keys = [];
        this.load();

        LOG(this.label, '>>> READY');
    }

    /**
     * autoload the routes
     */
    load() {
        fs.readdirSync(this.options.routes_dir).forEach(function (file) {
            let key = file.replace(/\.js/, '').toLowerCase();
            LOG(this.label, 'ADDING ROUTE FILE:', file, 'AS', `/${key}`);
            APP.use(`/${key}`, require(`${this.options.routes_dir}/${key}.js`));
            this.keys.push(key);
        }.bind(this));

        if (this.keys.length === 0) {
            LOG(this.label, 'NO ROUTES FOUND');
        } else {
            LOG(this.label, this.keys.length, 'ROUTE FILES LOADED');
        }
    }

    mergeOptions() {
        super.mergeOptions();
        this.options.routes_dir = `${APP_DIR}/lib/server/routes`;
    }

    get keys(){
        return this._keys;
    }

    set keys(param){
        this._keys = param;
    }

};