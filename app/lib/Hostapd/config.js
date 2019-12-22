import Module from '../Module.js';
import fs from 'fs-extra';

export default class extends Module {
    constructor(args) {
        super(args);

        this.name = 'accesspointconfig';
        this.label = 'ACCESSPOINT CONFIG';

        this.mergeOptions(args);
    }

    mergeOptions(args) {
        super.mergeOptions(args);
    }

    createConfigFile() {
        const options = this.options;
        LOG(this.label, 'CREATE CONFIG FILE', options.config_file);
        let configFileData = '\n# this file is managed by the drone boat app\n# dont touch it manually\n\n';
        Object.keys(options.config).forEach(key => {
            const item = options.config[key];
            if (typeof item === 'boolean') {
                if (item === true) {
                    configFileData += `${key}\n`;
                }
            }
            if (typeof item === 'string') {
                configFileData += `${key}=${item}\n`;
            }
            if (typeof item === 'object') {
                item.forEach(row => {
                    configFileData += `${key}=${row}\n`
                });
            }
        });
        fs.writeFileSync(options.config_file, configFileData);
    }
}
