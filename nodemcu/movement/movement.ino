#include <PubSubClient.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>

String clientName     = "mover";
const char* ssid      = "droneboat";
const char* password  = "CHANGE!ME";
char* server          = "droneboat";
char* topic           = "movement";

int RPWMright = 5;
int LPWMright = 4;
int RPWMleft = 0;
int LPWMleft = 2;
int maxPWM = 1023;

WiFiClient wifiClient;

void callback(char* topic, byte* payload, unsigned int length) {
  String encoded;
  for (int i = 0; i < length; i++) {
    encoded += (char)payload[i];
  }

  DynamicJsonDocument json(2048);
  DeserializationError error = deserializeJson(json, encoded);
  if (error)
    return;

  String name = json["name"];
  if (name == "throttle") {
    int leftValue = json["side"]["left"];
    int rightValue = json["side"]["right"];

    int value = json["value"];
    setSpeed(leftValue, "left");
    setSpeed(rightValue, "right");
    //Serial.print("Received: "); Serial.print(name); Serial.print(" : "); Serial.println(value);
  }

}

PubSubClient client(server, 9090, callback, wifiClient);

void setup()
{
  Serial.begin(9600);
  client.setCallback(callback);
  
  // motor driver
  analogWriteFreq(10000);
  
  pinMode(RPWMleft, OUTPUT);
  pinMode(LPWMleft, OUTPUT);
  pinMode(RPWMright, OUTPUT);
  pinMode(LPWMright, OUTPUT);

  digitalWrite(RPWMleft, LOW);
  digitalWrite(LPWMleft, LOW);
  digitalWrite(RPWMright, LOW);
  digitalWrite(LPWMright, LOW);

  setSpeed(0, "left");
  setSpeed(0, "right");
  
  WIFI_login();

  deviceReady();
  
  //Serial.println("SETUP READY");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    WIFI_login();
  }

  if(!client.connected()){
    MQTT_connect();
  }
  
  client.loop();
}

void WIFI_login() {
  Serial.printf("Connecting to %s ", ssid);
  WiFi.softAPdisconnect(true);
  WiFi.begin(ssid, password);
 // WiFi.config(staticIP, gateway, subnet);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WIFI CONNECTED");
  Serial.println("");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Netmask: ");
  Serial.println(WiFi.subnetMask());
  Serial.print("Gateway: ");
  Serial.println(WiFi.gatewayIP());
  MQTT_connect();
}

void MQTT_connect(){
  if (client.connect((char*) clientName.c_str())) {
    client.subscribe(topic);
    Serial.println("CONNECTED TO MQTT BROKER");
    Serial.print("Topic is: ");
    Serial.println(topic);

    if (client.publish(topic, "HELLO")) {
    } else {
      //Serial.println("Publish failed");
    }
  } else {
    MQTT_connect();
    //Serial.println("MQTT connect failed");
    //Serial.println("Will reset and try again...");
    //abort();
  }
}

/**
   wants a value between -100 and 100
*/
int setSpeed(int speed, String side) {
  int pwm = 0;
  int LPWM;
  int RPWM;

  if (side == "left") {
    LPWM = LPWMleft;
    RPWM = RPWMleft;
  } else {
    LPWM = LPWMright;
    RPWM = RPWMright;
  }

  if (speed == pwm) {
    //Serial.print("Stop Motor Speed: ");
    analogWrite(LPWM, pwm);
    analogWrite(RPWM, pwm);
  }
  if (speed > 0) {
    //Serial.print("Forward Motor Speed:");
    pwm = maxPWM / 100 * speed;
    analogWrite(LPWM, pwm);
    analogWrite(RPWM, 0);
  }
  if (speed < 0) {
    //Serial.print("Backward Motor Speed:");
    pwm = maxPWM / 100 * speed * -1;
    analogWrite(LPWM, 0);
    analogWrite(RPWM, pwm);
  }
  //Serial.print(speed);
  //Serial.print(" PWM: ");
  //Serial.println(pwm);
  return pwm;
}

void deviceReady(){
  setSpeed(25, "left");
  delay(300);
  setSpeed(50, "left");
  delay(300);
  setSpeed(75, "left");
  delay(300);
  setSpeed(100, "left");
  delay(300);
  setSpeed(0, "left");
  setSpeed(25, "right");
  delay(300);
  setSpeed(50, "right");
  delay(300);
  setSpeed(75, "right");
  delay(300);
  setSpeed(100, "right");
  delay(300);
  setSpeed(0, "right");
  delay(200);
  setSpeed(100, "right");
  setSpeed(100, "left");
  delay(200);
  setSpeed(0, "right");
  setSpeed(0, "left");
  delay(100);
  setSpeed(100, "right");
  setSpeed(100, "left");
  delay(200);
  setSpeed(0, "right");
  setSpeed(0, "left");
}
