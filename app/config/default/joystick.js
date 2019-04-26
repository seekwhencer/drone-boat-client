module.exports = {
    enabled: false,
    bin: '/usr/bin/jstest',
    autostart: true,
    device: '/dev/input/js0',
    axis: {
        yaw:0,
        pitch:1,
        throttle:2
    },
    buttons: {
        fire:0,
        fire_alt:1,
        fire5:4,
        fire6:5,
        fire7:6,
        fire8:7
    }
};
