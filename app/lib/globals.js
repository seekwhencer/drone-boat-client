const path = require('path'),
    Config = require('./config.js'),
    R = require('ramda'),
    Express = require('express'),
    Log = require('./log.js');

/**
 * Defining some global things here:
 */
global.DEBUG = process.env.NODE_DEBUG || false;
if(DEBUG === 'true') global.DEBUG = true;
if(DEBUG === 'false') global.DEBUG = false;

global.LOG = new Log().log;

/**
 * global process events
 */
process.on('uncaughtException', (error) => {
    LOG('ERROR:', error);
});
process.on('SIGINT', function () {
    MACHINE.dns.resetResolve();
    setTimeout(function () {
        process.exit(0);
    }, 5000);
});
process.stdin.resume();

/**
 * mapping global things
 * global thins
 */
global.APP_DIR = path.resolve(process.env.PWD);
process.env.NODE_CONFIG_ENV = process.env.NODE_ENV;
process.env.SUPPRESS_NO_CONFIG_WARNING = true;


global.PACKAGE = require(`${APP_DIR}/package.json`);
global.ENV = process.env.NODE_ENV || 'default';

LOG('//////////////////');
LOG('RUNNING:', PACKAGE.name);
LOG('VERSION:', PACKAGE.version);
LOG('ENVIRONMENT:', ENV);
LOG('/////////');
LOG('');

global.CONFIG = new Config();

global.HOST = process.env.NODE_HOST || CONFIG.api.host || 'localhost';
global.PORT = parseInt(`${process.env.NODE_PORT || CONFIG.api.port || 9090}`);

global.R = R;
global.EXPRESS = Express;
global.APP = EXPRESS();
