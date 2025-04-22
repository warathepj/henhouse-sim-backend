import mqtt from 'mqtt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing MQTT connection...');
console.log('Broker URL:', process.env.BROKER_URL);

const client = mqtt.connect(process.env.BROKER_URL, {
  username: process.env.USER,
  password: process.env.PASSWORD
});

client.on('connect', () => {
  console.log('Successfully connected to MQTT broker');
  
  // Publish a test message
  client.publish('test/topic', JSON.stringify({ test: 'message' }), { qos: 1 }, (err) => {
    if (err) {
      console.error('Error publishing test message:', err);
    } else {
      console.log('Test message published successfully');
    }
    
    // Close the connection
    client.end();
  });
});

client.on('error', (err) => {
  console.error('MQTT connection error:', err);
});