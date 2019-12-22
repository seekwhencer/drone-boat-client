import Module from '../Module.js';
import fs from 'fs-extra';
import crypto from 'crypto';

export default class extends Module {
    constructor(args) {
        super(args);

        this.name = 'dnsconfig';
        this.label = 'DNS CONFIG';

        this.mergeOptions(args);
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

    getAddresses() {
        const options = this.options;
        LOG(this.label, 'GET ADDRESS FILES IN:', options.addresses_path);
        let addressFiles = [];
        fs.readdirSync(options.addresses_path).forEach(file => {
            const fileName = `${options.addresses_path}/${file}`;
            LOG('FILENAME', fileName);
            const fileData = fs.readFileSync(fileName);
            const address = fileData.toString().split('=')[1];
            const target = address.split('/')[2];
            const source = address.split('/')[1];
            addressFiles.push({
                target: target,
                source: source,
                address: address,
                id: crypto.createHash('md5').update(`${address}`).digest("hex"),
                path: fileName
            });
        });
        const count = Object.keys(addressFiles).length;
        if (count === 0) {
            LOG(this.label, 'NO FILE FOUND');
        } else {
            LOG(this.label, count, 'ADDRESSES LOADED');
        }
        return addressFiles;
    }

    mergeOptions(args) {
        super.mergeOptions(args);
        this.options.config.server = this.options.config.server.split(',');
    }
}
