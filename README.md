# drone boat client
This is the node app to run the drone boat. 

- control two motors with direction and speed (PWM)
- gps
- time
- gyroscope
- fetching sensor data
  - Gas CO2
  - Gas Ozone
  - Barometric Pressure
  - Temperature
  - Dust
- front video streaming
- underwater video streaming

## Used hardware
### Powering
- 2 x 10 Ah / 12 V bike battery
- 4 x down converter to 5V with 2A
- 6 x power switch (both wires)
- 10 x wire plug pairs (male/female)
- 1 x sliding contact

### The Brain
- Raspberry Pi 3b
- external Wifi with antenna

### Movement
- ESP8266 NodeMcu
- BTS7960 (2x motor driver)
- PCA9685 (pwm)
- GY-GPS6MV2 (gps)
- GY-273 (gyro)

### Sensors (air)
- ESP8266 NodeMcu
- nova PM sensor SDS001 V2-008 (dust)
- ADC121C + MQ131 (gas)
- ADC121C + MQ135 (gas)
- MPL115A2 (bar.pressure)

### Sensors (water)
- ESP8266 NodeMcu
- Nitrate / Nitrite 
- Ammonium

### Camera Dolly
- ESP8266 NodeMCU
- Relay Shield 4x (on/off: light A, light B, movement, ...)
- L298N motor driver
- Gear motor 12V for pitch (rotate the camera itself)
- Gear motor 12V for yaw (drives a camera dolly on "hoola hoop ring" endless around in both directions)
- IP Camera (encodes a stream)

or as IP Camera

- Raspberry Pi
- USB Webcam


## NodeMCU
Burn the nodemcu programs on the devices. One for the movement and the other one for the sensors.
Use [Arduino Studio](https://www.arduino.cc/en/main/software).
```
 nodemcu/movement.xyz
 nodemcu/sensors.xyz
 nodemcu/dolly.xyz
```
you have to configure the I2C address on the shields:
```
 ADC121C + MQ131 (gas)      = ? 
 ADC121C + MQ135 (gas)      = ? 
 MPL115A2 (bar.pressure)    = ? 
```
To check the I2C addresses, you can plug it on the rasperry.
with a `i2cdetect` you can [see](https://learn.sparkfun.com/tutorials/raspberry-pi-spi-and-i2c-tutorial/all#i2c-on-pi) the plugged I2C addresses.

### Wiring

IMAGE

### Powering
Use enough power to drive that boat. I recommend two bike batteries with 10 Ah and 12 Volts.
Two pieces because one is for using and the other one is to charge and replace if needed.
Or you can build your own [Li-Ion]() Battery Pack with this [battery controller]().
 
From the battery you have split:
- 2 x to the two motor drivers as power input
- 3 x to one [down converter]() with 2A (2 for the NodeMCUs and 1 for the RPi)
- 1 x to sliding contact for the camera 360° camera dolly

### Communication
The NodeMCU modules communicate via [encrypted WP2 psk wifi](https://en.wikipedia.org/wiki/Hostapd) with the raspberry pi on the boat.
The Boat RPi is a:

For the NodeMCUs
- Wifi Accesspoint
- Web / Api Server
- Websocket Server
- DNS Server

For the Base Unit
- Wifi Client
- Rest Client
- Websocket Client

## The Base Unit
Is another Raspberry Pi or a better computer on the shore or on a second, larger boat with humans on board.
This Unit is the main server to store and process incoming realtime data. This thing contains:

- Raspberry Pi or better computer
- Wifi Accesspoint
- DNS Server
- DHCP Server (for other local clients and user interfaces)
- Mobile Internet Gateway
- Web / API Server
- Websocket Server

## Docker
The included `docker-compose.yaml` is for development. It contains all needed asset environment apps.
You can run it in production - but then reconfigure host and port vars for the app.

