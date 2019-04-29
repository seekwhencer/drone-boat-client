module.exports = {
    enabled: false,
    bin: '/usr/sbin/hostapd',
    autostart: true,
    restart_delay: 0,
    config_file: 'lib/hostapd/hostapd.conf',
    config: {
        'interface': 'wlan0',
        'driver': 'nl80211',
        'ssid': 'droneboat',
        'hw_mode': 'g',
        'channel': '6',
        'ieee80211n': '1',
        'wmm_enabled': '1',
        'macaddr_acl': '0',
        'auth_algs': '1',
        'ignore_broadcast_ssid': '0',
        'country_code': 'DE',
        'wpa': '2',
        'wpa_key_mgmt': 'WPA-PSK',
        'wpa_passphrase': 'CHANGE!ME',
        'rsn_pairwise': 'CCMP'
    }
};
