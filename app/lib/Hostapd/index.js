import Module from '../Module.js';
import Config from './config.js';
import {spawn} from 'child_process';

export default class extends Module {

    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.name = 'accesspoint';
            this.label = 'ACCESSPOINT';

            this.defaults = CONFIG.accesspoint;

            LOG(this.label, 'INIT');
            this.mergeOptions(args);

            if (this.options.enabled === false)
                resolve(false);

            this.proccess = false;
            this.config = new Config(this.options);
            this.createConfigFile();

            if (this.options.autostart === true) {
                this.start();
            }

            this.on('ready', () => {
                LOG('');
                LOG(this.label, '>>> READY');
                LOG('');
                resolve(this);
            });

        });
    }

    mergeOptions(args) {
        super.mergeOptions(args);
        this.options.config_file = P(`${this.options.config_path}/hostapd.conf`);
    }

    createConfigFile() {
        this.createFolder(P(this.options.config_path));
        this.config.createConfigFile();
    }

    getAddresses() {
        return this.config.getAddresses();
    }

    start() {
        const processOptions = ['-d', this.options.config_file];
        LOG(this.label, 'STARTING WITH OPTIONS', JSON.stringify(processOptions));

        this.process = spawn(this.options.bin, processOptions);

        this.process.stdout.setEncoding('utf8');
        this.process.stdout.on('data', (chunk) => {
            if (this.options.tty === true) {
                this.monitor(chunk);
            }
            this.processEvents(chunk);
        });

        this.process.stderr.setEncoding('utf8');
        this.process.stderr.on('data', (chunk) => {
            if (this.options.tty === true) {
                this.monitor(chunk);
            }
            this.processEvents(chunk);
        });

        this.process.stderr.on('end', () => {
            this.emit('exited');
        });
    }

    processEvents(chunk) {
        const events = {
            ready: [
                'Setup of interface done',
            ],
            error: 'Failed to allocate required memory.'
        };
        Object.keys(events).forEach(m => {
            if (events[m] === '')
                return;

            if (typeof events[m] === 'object') {
                events[m].forEach(mm => {
                    if (chunk.includes(mm)) {
                        this.emit(m);
                    }
                });
            } else {
                if (chunk.includes(events[m])) {
                    this.emit(m);
                }
            }
        });
    }

    stop() {
        this.proc.kill();
    }

    restart() {
        const options = this.options;
        this.stop();
        setTimeout(() => {
            this.start();
        }, options.restart_delay);
    }

    monitor(chunk) {
        if (chunk) {
            const split = chunk.toString().split('\n');
            split.forEach((row) => {
                if (row !== '') {
                    LOG(this.label, row);
                }
            });
        }
    }

};