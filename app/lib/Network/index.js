import Module from '../Module.js';
import {spawn} from 'child_process';

export default class extends Module {

    constructor(args) {
        super(args);
        return new Promise((resolve, reject) => {
            this.label = 'NETWORK';

            this.defaults = CONFIG.network;

            LOG(this.label, 'INIT');
            this.mergeOptions(args);

            if (this.options.enabled === false)
                resolve(false);

            this.hooks();

            LOG('');
            LOG(this.label, '>>> READY');
            LOG('');
            resolve(this);
        });
    }

    hooks(){
        LOG(this.label, 'HOOKS');
        if(!this.options.hooks || this.options.hooks === 'undefined')
            return;

        this.options.hooks.forEach(i => {
            this.hook(i);
        });
    }

    hook(name) {
        LOG(this.label, 'HOOK:', name);
        this.options.hook[name].forEach(i => {
            let runOptions = {
                name: name,
                bin: i.split(' ')[0],
                params: (i.split(' '))
            };
            runOptions.params.shift();
            this.run(runOptions);
        });
    }

    run(runOptions) {
        LOG(this.label, runOptions.name, 'HOOKING WITH', JSON.stringify(runOptions));
        spawn(runOptions.bin, runOptions.params);
    }
}