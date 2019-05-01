module.exports = {
    enabled: true,
    bin: '/usr/bin/jstest',
    autostart: true,
    device: '/dev/input/js0',
    axis: {
        yaw: {
            number: 0,
            default: 0,
            in: {
                max: -33000,
                min: 33000
            },
            out: {
                max: 100,
                min: -100
            }
        },
        pitch: {
            number: 1,
            default: 0,
            in: {
                max: -33000,
                min: 33000
            },
            out: {
                max: 100,
                min: -100
            }
        },
        throttle: {
            number: 2,
            default: 0,
            duty_time: 50,
            duty_value: 1,
            in: {
                max: -40000,
                min: 40000
            },
            out: {
                max: 100,
                min: -100
            }
        }
    },
    buttons: {
        button1: {number: 0},
        button2: {number: 1},
        button5: {number: 4},
        button6: {number: 5},
        button7: {number: 6},
        button8: {number: 7}
    }
};
