#include <PubSubClient.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>

const char* ssid     = "droneboat";
const char* password = "CHANGE!ME";

char* topic = "movement";
char* server = "droneboat";

void callback(char* topic, byte* payload, unsigned int length) {
  // handle message arrived
}

WiFiClient  wifiClient;
PubSubClient client(server, 9090, callback, wifiClient);



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

  String clientName = "mover";

  if (client.connect((char*) clientName.c_str())) {
    Serial.println("Connected to MQTT broker");
    Serial.print("Topic is: ");
    Serial.println(topic);

    if (client.publish(topic, "hello from ESP8266")) {
      Serial.println("Publish ok");
    }
    else {
      Serial.println("Publish failed");
    }
  }
  else {
    Serial.println("MQTT connect failed");
    Serial.println("Will reset and try again...");
    //abort();
  }
}

void loop() {
  static int counter = 0;
  
  String payload = "{\"micros\":";
  payload += micros();
  payload += ",\"counter\":";
  payload += counter;
  payload += "}";
  
  if (client.connected()){
    Serial.print("Sending payload: ");
    Serial.println(payload);
    
    if (client.publish(topic, (char*) payload.c_str())) {
      Serial.println("Publish ok");
    }
    else {
      Serial.println("Publish failed");
    }
  }
  ++counter;
  delay(5000);
}
