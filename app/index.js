import './lib/Globals.js';
import Droneboat from './lib/Droneboat.js';

new Droneboat()
    .then(droneboat => {
        global.BOAT = droneboat;

        LOG('');
        LOG('');
        LOG(this.label, '>>> ALL COMPLETE!');
    });
