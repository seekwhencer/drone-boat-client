module.exports = {
    bin: '/usr/sbin/dnsmasq',
    autostart: true,
    restart_delay: 0,
    config_file: 'lib/dnsmasq/dnsmasq.conf',
    config_dir: 'lib/dnsmasq/config',
    lease_file: 'lib/dnsmasq/leases',
    resolv_file: '/etc/resolv.conf',

    config: {

        'interface': 'wlan0',
        'dhcp-range': 'wlan0,192.168.100.100,192.168.100.199,12h',

        'log-queries': true,
        'strict-order': true,
        'expand-hosts': true,

        'no-resolv': true,
        'no-hosts': true,
        'domain-needed': false,
        'bogus-priv': false,

        'server': [
//            '127.0.0.1',
            '192.168.178.1',
            '8.8.8.8',
        ],
        'local': '/droneboat/',
        'conf-dir': null,
        'dhcp-leasefile': null
    }
};