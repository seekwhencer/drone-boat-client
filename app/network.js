import './lib/Globals.js';
import Network from './lib/Network.js';

new Network()
    .then(network => {
        global.NETWORK = network;

        LOG('');
        LOG('');
        LOG(this.label, '>>> NETWORK IS UP AND RUNNING!');
    });
