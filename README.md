# drone boat client
This is the node app to run the drone boat.

**WORK IN PROGRESS**

That works at the moment:

- managing accesspoint
- managing dns server
- mqtt broker
- joystick control
- controlling two motor drivers via mqtt on a nodeMCU
- app splitting
- gps

## Starting
The app is splitted in three apps at the moment:

#### `brain`
- MQTT Broker
- GPS
- Switches (light)

```
npm run dev
```

#### `networking`
- hostapd (wifi accesspoint)
- dnsmasq (dns server)

```
npm run network
```

#### `control`
- joystick
```
npm run control
```

Every app act as mqtt client. 

#### MQTT Clients
 
*node app*
- `boat`
- `network`
- `joystick`

*nodeMCU*
- `mover`
- `switches`
- `sensors` (coming)

#### PM2
```
cd /data/app
pm2 start "npm run dev" --name "boat"
pm2 start "npm run network" --name "network"
pm2 start "npm run control" --name "joystick"
pm2 save

```