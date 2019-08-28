#include <PubSubClient.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>

String clientName     = "switches";
const char* ssid      = "droneboat";
const char* password  = "CHANGE!ME";
char* server          = "droneboat";
char* topic           = "switch";

WiFiClient  wifiClient;

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
  if (name == "front_light") {

  }
}

PubSubClient client(server, 9090, callback, wifiClient);

void setup()
{
  Serial.begin(9600);
  client.setCallback(callback);

  WIFI_login();

  //Serial.println("SETUP READY");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) WIFI_login();
  if(!client.connected()) MQTT_connect();
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
