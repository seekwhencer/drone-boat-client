# drone boat client
This is the application set for a two motors driven boat.

**WORK IN PROGRESS**  
*Using Node.js 12 with the `experimental modules` feature.* 

That works at the moment:

- managing accesspoint
- managing dns server
- mqtt broker
- joystick control
- controlling two motor drivers via mqtt on a nodeMCU
- gps
- app splitting, any app acts as mqtt client

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

#### MQTT Clients (`clientId`)
 
*node app*
- `boat`
- `network`
- `joystick`

*nodeMCU*
- `mover`
- `switches`
- `sensors` (coming)

##### MQTT Topics
- `movement`
```json
{
    "name":"throttle",
    "value":39,
    "side":{
        "left":39,
        "right":39
    }
}
```

```
{
    "name":"button1",
    "value":false
}
```

- `gps`
```json
{
    "lat":52.549405,
    "lon":13.198883333333333,
    "time":"2019-8-20 10:57:46",
    "timestamp":1566291466000,
    "milliseconds":"6000",
    "speed":0
}
```


- `network`
```json
{
    "subject":"client",
    "action":"disconnected"
}
```
`client` means a wifi client  
`action` can be `connected` and `disconnected`

#### PM2
To start the system on boot.

```
cd /data/app
pm2 start "npm run dev" --name "boat"
pm2 start "npm run network" --name "network"
pm2 start "npm run control" --name "joystick"
pm2 save
```
