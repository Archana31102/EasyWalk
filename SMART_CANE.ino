#include <NewPing.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <PubSubClient.h>
#include <WiFi.h>

// Replace these with your WiFi credentials
const char *ssid = "project";
const char *password = "project@123";

// Replace this with the address of your MQTT broker
const char *mqttBroker = "103.217.220.20";
const int mqttPort = 1883;

// Define the pins for the first ultrasonic sensor
#define TRIGGER_PIN_1 12
#define ECHO_PIN_1 14

// Define the pins for the second ultrasonic sensor
#define TRIGGER_PIN_2 27
#define ECHO_PIN_2 26

// Define the pins for the third ultrasonic sensor
#define TRIGGER_PIN_3 32
#define ECHO_PIN_3 33

// Define the pin for the moisture sensor data
#define MOISTURE_PIN 15  // Change this to the desired GPIO pin

// Define the buzzer pin
#define BUZZER_PIN 13 // Change this to an available pin

#define BUTTON_PIN 2

// Define the pins for the GPS module
#define GPS_RX_PIN 17
#define GPS_TX_PIN 16
#define GPS_BAUD_RATE 9600

// Define the maximum distance to check for obstacles
#define MAX_DISTANCE 200

// Define obstacle distances for each sensor
#define OBSTACLE_DISTANCE_1 20
#define OBSTACLE_DISTANCE_2 10
#define OBSTACLE_DISTANCE_3 12

// Define the expected range for the distance ratio
#define EXPECTED_RATIO_MIN 0.5
#define EXPECTED_RATIO_MAX 2.0

// Create instances of the NewPing class for each sensor
NewPing sonar1(TRIGGER_PIN_1, ECHO_PIN_1, MAX_DISTANCE);
NewPing sonar2(TRIGGER_PIN_2, ECHO_PIN_2, MAX_DISTANCE);
NewPing sonar3(TRIGGER_PIN_3, ECHO_PIN_3, MAX_DISTANCE);

// Create a SoftwareSerial  object for the GPS module
SoftwareSerial gpsSerial(GPS_RX_PIN, GPS_TX_PIN);

// Create a TinyGPS++ object
TinyGPSPlus gps;

// Create a WiFiClient instance to connect to the MQTT server
WiFiClient espClient;
PubSubClient client(espClient);
bool buttonPressed = false;

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Connect to MQTT broker
  client.setServer(mqttBroker, mqttPort);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(MOISTURE_PIN, INPUT);
   pinMode(BUTTON_PIN, INPUT_PULLUP); // Internal pull-up resistor

  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), buttonISR, FALLING);
}

void loop() {
  // Connect to MQTT if not connected
  if (!client.connected()) {
    reconnect();
  }

  // Get distance from the first sensor
  unsigned int distance1 = sonar1.ping_cm();

  // Get distance from the second sensor
  unsigned int distance2 = sonar2.ping_cm();

  // Get distance from the third sensor
  unsigned int distance3 = sonar3.ping_cm();

  // Read moisture level
  int moistureLevel = digitalRead(MOISTURE_PIN);

  // Print the distances and moisture level to the serial monitor
  Serial.print("Distance Sensor 1: ");
  Serial.print(distance1);
  Serial.print(" cm\t");

  Serial.print("Distance Sensor 2: ");
  Serial.print(distance2);
  Serial.print(" cm\t");

  Serial.print("Distance Sensor 3: ");
  Serial.print(distance3);
  Serial.print(" cm\t");

  Serial.print("Moisture Level: ");
  Serial.println(moistureLevel == HIGH ? "Dry" : "Wet");

  // Check for obstacles based on predefined distances
  if (distance1 <= OBSTACLE_DISTANCE_1) {
    Serial.println("Obstacle detected by Sensor 1!");
    // Add your actions for obstacle detection by Sensor 1
    beepBuzzer(1); // Single beep
  }

  if (distance2 <= OBSTACLE_DISTANCE_2) {
    Serial.println("Obstacle detected by Sensor 2!");
    // Add your actions for obstacle detection by Sensor 2
    beepBuzzer(2); // Single beep
  }

  if (distance3 <= OBSTACLE_DISTANCE_3) {
    Serial.println("Obstacle detected by Sensor 3!");
    // Add your actions for obstacle detection by Sensor 3
    beepBuzzer(2);
  }

  // Check moisture level and trigger a triple beep if moisture is detected
  if (moistureLevel == LOW) {
    Serial.println("Moisture detected! Triple beeping the buzzer.");
    beepBuzzer(3); // Triple beep
  }

  
   if (buttonPressed) {
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid()) {
        Serial.print("Latitude: ");
        Serial.print(gps.location.lat(), 6);
        Serial.print(", Longitude: ");
        Serial.println(gps.location.lng(), 6);

        // Publish GPS data to MQTT
        publishGPS(gps.location.lat(), gps.location.lng());
      } else {
        Serial.println("Waiting for valid GPS data...");
      }
    }
  }
  }

  // Maintain the MQTT connection
  client.loop();

  delay(500); // Adjust delay as needed
}

void beepBuzzer(int beepType) {
  // Beep the buzzer based on the specified beep type
  if (beepType == 1) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(1000); // Single beep duration
    digitalWrite(BUZZER_PIN, LOW);
  } else if (beepType == 2) {
    for (int i = 0; i < 2; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(500); // Duration of each beep in the double beep
      digitalWrite(BUZZER_PIN, LOW);
      delay(500); // Interval between beeps in the double beep
    }
  } else if (beepType == 3) {
    for (int i = 0; i < 3; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(200); // Duration of each beep in the triple beep
      digitalWrite(BUZZER_PIN, LOW);
      delay(200); // Interval between beeps in the triple beep
    }
  }
}

void publishGPS(float latitude, float longitude) {
  // Publish GPS data to the specified MQTT topic
  String topic = "gps_data";
  String payload = String(latitude, 6) + "," + String(longitude, 6);
  client.publish(topic.c_str(), payload.c_str());
  Serial.println("Published GPS data to MQTT");
}

void reconnect() {
  // Loop until we're reconnected to the MQTT broker
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32Client")) {
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void buttonISR() {
  // Interrupt Service Routine (ISR) for the push button
  buttonPressed = true;
}

