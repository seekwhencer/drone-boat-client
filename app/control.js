import './lib/Globals.js';
import Control from './lib/Control.js';

new Control()
    .then(control => {
        global.CONTROL = control;

        LOG('');
        LOG('');
        LOG(this.label, '>>> ALL COMPLETE!');
    });
