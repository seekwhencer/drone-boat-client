import fs from 'fs-extra';
import Module from '../Module.js';
import Config from './config.js';
import {spawn} from 'child_process';

export default class extends Module {

    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.name = 'dnsmasq';
            this.label = 'DNSMASQ';

            this.defaults = CONFIG.dns;

            LOG(this.label, 'INIT');
            this.mergeOptions(args);

            if (this.options.enabled === false)
                resolve(false);

            this.proc = false;
            this.config = new Config(this.options);

            this.createConfigFile();
            this.getAddresses();

            if (this.options.autostart === true) {
                this.resolve();
                this.start();
            }

            this.on('ready', () => {
                LOG('');
                LOG(this.label, '>>> READY');
                LOG('');
                resolve(this);
            });

            this.on('client_connected', chunk => {
                if (!chunk || chunk === 'undefined')
                    return;

                const clientArraySrc = chunk.split('\n');
                if(!clientArraySrc[3])
                    return;

                if (clientArraySrc[3].length < 2)
                    return;

                const clientArray = clientArraySrc[3].split(' ').slice(-3);
                const client = {
                    subject: 'client',
                    action: 'connected',
                    ip4: clientArray[0],
                    mac: clientArray[1],
                    hostname: clientArray[2]
                };
                MQTT.publish(`network`, client);
            });
        });
    }

    mergeOptions(args) {
        super.mergeOptions(args);
        this.options.config_path = P(this.options.config_path);
        this.options.addresses_path = `${this.options.config_path}/${this.options.addresses_path}`;

        this.options.config_file = `${this.options.config_path}/dnsmasq.conf`;
        this.options.config['dhcp-leasefile'] = `${this.options.config_path}/${this.options.lease_file}`;
        this.options.config['conf-dir'] = `${this.options.addresses_path}/,*.conf`;
    }

    createConfigFile() {
        this.createFolder(P(this.options.config_path));
        this.createFolder(P(this.options.addresses_path));
        this.config.createConfigFile();
    }

    getAddresses() {
        return this.config.getAddresses();
    }

    start() {
        const processOptions = ['-C', this.options.config_file, '--no-daemon'];
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
                'gestartet',
            ],
            error: 'Failed to allocate required memory.',
            client_connected: `DHCPACK(${this.options.config.interface})`,
        };
        Object.keys(events).forEach(m => {
            if (events[m] === '')
                return;

            if (typeof events[m] === 'object') {
                events[m].forEach(mm => {
                    if (chunk.includes(mm)) {
                        this.emit(m, chunk);
                    }
                });
            } else {
                if (chunk.includes(events[m])) {
                    this.emit(m, chunk);
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

    resolve() {
        const resolvFileData = 'nameserver 127.0.0.1';
        fs.writeFileSync(this.options.resolv_file, resolvFileData);
    }

    resetResolve() {
        LOG(this.label, 'RESET RESOLVE');
        spawn('/sbin/resolvconf', ['-u']);
    }

    monitor(chunk) {
        if (chunk) {
            const split = chunk.toString().split('\n');
            split.forEach((row) => {
                if (row !== '') {
                    LOG(this.label, row.replace('dnsmasq: ', ''));
                }
            });
        }
    }

    matchLog(row, matches) {
        const found = {};
        Object.keys(matches).forEach(event => {
            if (row.match(matches[event])) {
                found[event] = {
                    row: row,
                    event: event,
                    find: matches[event]
                };
            }
        });
        if (Object.keys(found).length === 0)
            return false;

        return found;
    }

};