#include <Adafruit_MPL115A2.h>
#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <ADC121C_MQ135.h>

static const int RXPin = 12, TXPin = 13; // D6 = PIN 12, D7 = PIN 13
static const uint32_t GPSBaud = 9600;
const double Home_LAT = 52.550003;
const double Home_LNG = 13.200272;
const char* ssid     = "pispot";
const char* password = change!me";
#define mq131_addr 0x55
#define mq135_addr 0x5a


TinyGPSPlus gps;
SoftwareSerial ss(RXPin, TXPin);
WiFiClient  client;
WebSocketsClient webSocket;
Adafruit_MPL115A2 mpl115a2;
ADC121C_MQ135 mq135;

bool is_connected = false;

void setup()
{
  Serial.begin(9600);
  // Wifi Setup
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Netmask: ");
  Serial.println(WiFi.subnetMask());
  Serial.print("Gateway: ");
  Serial.println(WiFi.gatewayIP());
  delay(500);

  // Websocket Setup
  webSocket.begin("25.25.25.1", 8383, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  delay(500);

  // GPS
  ss.begin(GPSBaud);
  delay(500);

  // Temperature / Pressure
  mpl115a2.begin();
  delay(500);

  mq135.getAddr_ADC121C_MQ135(mq135_addr);
  mq135.setCycleTime(CYCLE_TIME_32);                    // Tconvert x 32, 27 ksps
  // mq135.setCycleTime(AUTOMATIC_MODE_DISABLED);       // Automatic Mode Disabled, 0 ksps
  // mq135.setCycleTime(CYCLE_TIME_64);                 // Tconvert x 64, 13.5 ksps
  // mq135.setCycleTime(CYCLE_TIME_128);                // Tconvert x 128, 6.7 ksps
  // mq135.setCycleTime(CYCLE_TIME_256);                // Tconvert x 256, 3.4 ksps
  // mq135.setCycleTime(CYCLE_TIME_512);                // Tconvert x 512, 1.7 ksps
  // mq135.setCycleTime(CYCLE_TIME_1024);               // Tconvert x 1024, 0.9 ksps
  // mq135.setCycleTime(CYCLE_TIME_2048);               // Tconvert x 2048, 0.4 ksps

  mq135.setAlertHold(ALERT_HOLD_CLEAR);                 // Alerts will self-clear
  // mq135.setAlertHold(ALERT_HOLD_NOCLEAR);            // Alerts will not self-clear

  mq135.setAlertFlag(ALERT_FLAG_DISABLE);               // Disables alert status bit in the Conversion Result register
  // mq135.setAlertFlag(ALERT_FLAG_ENABLE);             // Enables alert status bit in the Conversion Result register

  mq135.setAlertPin(ALERT_PIN_DISABLE);                 // Disables the ALERT output pin
  // mq135.setAlertPin(ALERT_PIN_ENABLE);               // Enables the ALERT output pin

  mq135.setPolarity(POLARITY_LOW);                      // Sets the ALERT pin to active low
  // mq135.setPolarity(POLARITY_HIGH);                  // Sets the ALERT pin to active high

  mq135.begin();

  // Calibrate your Sensor to Obtain Precise Value
  mq135.Calibration();
  // We Deduce Resistance of the Sensor in Clean Air (Ro) in the Serial Port
  // Serial.print("Ro = ");
  // Serial.println(mq135.Measure_Ro());

  delay(500);
}

void loop()
{
  readGPS();
  delay(500);
  readPressureTemp();
  delay(500);
  readMQ135();
  //delay(500);
  webSocket.loop();
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("WEBSOCKET Disconnected!\n");
      is_connected = false;
      break;

    case WStype_CONNECTED:
      Serial.printf("WEBSOCKET Connected to url: %s\n", payload);
      webSocket.sendTXT("{\"message\":\"Connected\"");
      is_connected = true;
      break;

    case WStype_TEXT:
      Serial.printf("WEBSOCKET get text: %s\n", payload);

      // send message to server
      // webSocket.sendTXT("message here");
      break;

    case WStype_BIN:
      Serial.printf("WEBSOCKET get binary length: %u\n", length);
      hexdump(payload, length);

      // send data to server
      // webSocket.sendBIN(payload, length);
      break;
  }

}

void readGPS()
{
  unsigned long Distance_To_Home = (unsigned long)TinyGPSPlus::distanceBetween(gps.location.lat(), gps.location.lng(), Home_LAT, Home_LNG);
  String output;
  DynamicJsonBuffer jsonBuffer;
  JsonObject& json = jsonBuffer.createObject();

  json["lat"] = gps.location.lat();
  json["lng"] = gps.location.lng();
  json["hour"] = gps.time.hour();
  json["minute"] = gps.time.minute();
  json["second"] = gps.time.second();
  json["day"] = gps.date.day();
  json["month"] = gps.date.month();
  json["year"] = gps.date.year();
  json["satellites"] = gps.satellites.value();
  json["elevation"] = gps.altitude.feet();
  json["heading"] = gps.course.deg();
  json["speed"] = gps.speed.mph();
  json["distance"] = Distance_To_Home;

  delay(500);
  smartDelay(500);
  if (millis() > 5000 && gps.charsProcessed() < 10)
    Serial.println(F("No GPS data received: check wiring"));

  json.printTo(output);
  Serial.println(output);

  // Send it
  if (is_connected == true)
    webSocket.sendTXT(output);
}

void readPressureTemp()
{
  DynamicJsonBuffer jsonBuffer;
  JsonObject& json = jsonBuffer.createObject();
  String output;
  float pressureKPA = 0, temperatureC = 0;
  mpl115a2.getPT(&pressureKPA,&temperatureC);
  pressureKPA = mpl115a2.getPressure();
  temperatureC = mpl115a2.getTemperature();
  json["pressure"] = pressureKPA;
  json["temperature"] = temperatureC;
  json.printTo(output);
  Serial.println(output);

  // send it
  if (is_connected == true)
    webSocket.sendTXT(output);

}

void readMQ135()
{
  byte error;
  int8_t address;
  DynamicJsonBuffer jsonBuffer;
  JsonObject& json = jsonBuffer.createObject();
  String output;
  address = mq135.ADC121C_MQ135_i2cAddress;
  // The i2c_scanner uses the return value of
  // the Write.endTransmisstion to see if
  // a device did acknowledge to the address.
  Wire.beginTransmission(address);
  error = Wire.endTransmission();
  if (error == 0)
  {
      uint16_t result;
      float ppmCO2 = mq135.Measure_CarbonDioxide(-0.32, 1.0);
      float ppmNH3 = mq135.Measure_Ammonia(-0.41, 1.0);
      json["co2"] = ppmCO2;
      json["nh3"] = ppmNH3;
      json.printTo(output);
      Serial.println(output);

      // send it
      if (is_connected == true)
        webSocket.sendTXT(output);
  }
  else
  {
      Serial.println("ADC121C_MQ135 Disconnected!");
      Serial.println(" ");
      Serial.println("        ************        ");
      Serial.println(" ");
  }
}

static void smartDelay(unsigned long ms)
{
  unsigned long start = millis();
  do
  {
    while (ss.available())
      gps.encode(ss.read());
  } while (millis() - start < ms);
}






