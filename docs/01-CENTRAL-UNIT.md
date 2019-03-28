# central unit
The main computer on the drone boat is a Raspberry Pi. All software runs 'bare metal' without any virtualisation.

## dependencies
- **[Ansible](https://www.ansible.com/)** is for the automated installation of any dependencies.
Only the manual installation of Ansible is needed. After that, all other
dependencies will be installed with the ansible playbook.
the playbook is part of this repository.
- **[Redis](https://redis.io/)** is a memcache, used to store data in the memory of the raspberry pi.
- **[Elasticsearch](https://www.elastic.co/de/products/elasticsearch)** is the database, stored on external ssd.
- **[Node.js](https://nodejs.org/en/)** is the runtime environment of the main application.
- **[PM2](http://pm2.keymetrics.io/)** is a Node.js process manager to run a Node.js app on system boot.
- **[hostapd]()** is a wifi accesspoint 
- **[dnsmasq]()** is a dns and dhcp server

## Hardware
- Raspberry Pi 3b
- external Wifi with antenna
- down converter from 12V to 5V with 2A

## Networking
The RPi runs his own internal wifi module as accesspoint only for the NodeMCU
and for a direct support access to the boat. The distance between the RPi
and the NodeMCUs is under one meter. The range of the internal wifi is not so much,
but enough for the internal communication.
 
The RPi is a **Websocket** and **Rest API Server** for his **wifi accesspoint (AP) clients**  (the NodeMCUs).
And the RPi is a **wifi client** with the Base Unit. For this we use a second usb wifi module,
plugged directly on the raspberry pi.
 
No networking or other wires needed to communicate with the block parts.

## Block Groups
A block group is a group of components, of modules like sensor modules or motor driver and
one NodeMCU. The NodeMCU is here the "mini brain". A controller for the connected shields.
On this mini brain runs software from the folder `nodemcu/`

### Movement
Controls the movement of the boat.
```
nodemcu/movement.js
```

### Sensors
Fetches sensor data.
```
nodemcu/sensors.js
```

### Dolly
Move the camera dolly, switch things on and of, like different lights.
```
nodemcu/dolly.js
```

## environment
Some things must be configured initially.

### Networking
#### Accesspoint
Setup hostapd
#### Network
##### DHCP
Setup dnsmasq
##### DNS
Setup dnsmasq
##### Routing

### Redis
Setup Redis
### Elasticsearch
Setup Eslasticsearch
### PM2
Setup PM2

