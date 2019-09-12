import './lib/Globals.js';
import Droneboat from './lib/Droneboat.js';

new Droneboat()
    .then(droneboat => {
        global.BOAT = droneboat;

        LOG('');
        LOG('');
        LOG('>>>    APP IS RUNNING ... ');
        LOG('');
        LOG('');
    });
