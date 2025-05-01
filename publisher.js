/**
 * Publisher module for handling temperature data from the farm
 */
import express from 'express';
import cors from 'cors';
import mqtt from 'mqtt';
import dotenv from 'dotenv';
import logger from './logger.js';

// Load environment variables
dotenv.config();

// MQTT topics
const MQTT_TOPICS = {
  TEMPERATURE: 'farm/sensors/temperature',
  COOP_A: 'farm/coops/a/temperature',
  COOP_B: 'farm/coops/b/temperature',
  COOP_C: 'farm/coops/c/temperature',
  VENTILATION: 'farm/ventilation/temperature',
  PROCESSING: 'farm/processing/temperature'
};

// MQTT client setup with credentials
const client = mqtt.connect(process.env.BROKER_URL, {
  username: process.env.USER,
  password: process.env.PASSWORD
});

client.on('connect', () => {
  logger.info('========== MQTT Connection ==========');
  logger.info('Successfully connected to MQTT broker');
});

client.on('error', (err) => {
  logger.error('========== MQTT Error ==========', err);
});

client.on('close', () => {
  logger.info('========== MQTT Connection Closed ==========');
});

client.on('offline', () => {
  logger.info('========== MQTT Client Offline ==========');
});

// Mock API endpoint for demonstration
const API_ENDPOINT = 'https://api.henhouse-manager.com/temperature-data';
const app = express();
const PORT = 3000;

// Configure Express
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'], // Allow requests from Vite dev servers
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// In-memory storage for temperature data
let temperatureDataStorage = null;

/**
 * Publishes temperature data to external systems
 * @param {Object} data - Temperature data object from sensors
 */
const publishTemperatureData = (data) => {
  logger.info('========== Temperature Data Received ==========');
  logger.debug('Raw data: ' + JSON.stringify(data, null, 2));
  
  if (!data) {
    logger.error('No data received');
    return null;
  }

  // Format timestamp for better readability
  const timestamp = new Date(data.timestamp).toLocaleString();
  
  // Create a detailed log header
  logger.info('========== Temperature Data Received from Coop Vision Architect ==========');
  logger.info(`Timestamp: ${timestamp}`);
  logger.info('Detailed Sensor Readings:');
  
  // Log Coop A details
  logger.info('\nCoop A:');
  logger.info(`  Corner Temperature: ${data.coopA.corner}°C`);
  logger.info(`  Center Temperature: ${data.coopA.center}°C`);
  
  // Log Coop B details
  logger.info('\nCoop B:');
  logger.info(`  Corner Temperature: ${data.coopB.corner}°C`);
  logger.info(`  Center Temperature: ${data.coopB.center}°C`);
  
  // Log Coop C details
  logger.info('\nCoop C:');
  logger.info(`  Center Temperature: ${data.coopC.center}°C`);
  
  // Log Ventilation details
  logger.info('\nVentilation System:');
  logger.info(`  Main: ${data.ventilation.main}°C`);
  logger.info(`  Secondary: ${data.ventilation.secondary}°C`);
  logger.info(`  East: ${data.ventilation.east}°C`);
  
  // Log Processing details
  logger.info('\nProcessing Area:');
  logger.info(`  Egg Washing: ${data.processing.eggWashing}°C`);
  logger.info(`  Egg Storage: ${data.processing.eggStorage}°C`);
  
  logger.info('\nPublishing data to MQTT topics...');
  
  // Store data in memory for persistence
  temperatureDataStorage = data;
  
  // Publish to MQTT broker with different topics
  const publishPromises = [
    // Publish complete data
    new Promise((resolve, reject) => {
      client.publish(MQTT_TOPICS.TEMPERATURE, JSON.stringify(data), { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }),
    // Publish Coop A data
    new Promise((resolve, reject) => {
      client.publish(MQTT_TOPICS.COOP_A, JSON.stringify(data.coopA), { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }),
    // Publish Coop B data
    new Promise((resolve, reject) => {
      client.publish(MQTT_TOPICS.COOP_B, JSON.stringify(data.coopB), { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }),
    // Publish Coop C data
    new Promise((resolve, reject) => {
      client.publish(MQTT_TOPICS.COOP_C, JSON.stringify(data.coopC), { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }),
    // Publish ventilation data
    new Promise((resolve, reject) => {
      client.publish(MQTT_TOPICS.VENTILATION, JSON.stringify(data.ventilation), { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }),
    // Publish processing data
    new Promise((resolve, reject) => {
      client.publish(MQTT_TOPICS.PROCESSING, JSON.stringify(data.processing), { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    })
  ];

  Promise.all(publishPromises)
    .then(() => {
      logger.info('✓ Successfully published all temperature data to MQTT broker');
    })
    .catch((error) => {
      logger.error('✗ Error publishing to MQTT:', error);
    });
  
  return data;
};

/**
 * Retrieves the latest published temperature data
 * @returns {Object|null} The latest temperature data or null if none exists
 */
const getLatestTemperatureData = () => {
  try {
    return temperatureDataStorage;
  } catch (error) {
    console.error('Error retrieving temperature data:', error);
    return null;
  }
};

/**
 * Subscribes to temperature updates
 * @param {Function} callback - Function to call when temperature data is updated
 * @returns {Function} Unsubscribe function
 */
const subscribeToTemperatureUpdates = (callback) => {
  // This function needs to be reimplemented for Node.js
  // For now, it's a stub that returns a no-op function
  console.warn('subscribeToTemperatureUpdates is not implemented in Node.js environment');
  return () => {};
};

// Routes
app.post('/api/temperature-data', (req, res) => {
  console.log('\n========== Temperature Data Received from API ==========');
  console.log(`Timestamp: ${new Date().toLocaleString()}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Process the temperature data
  publishTemperatureData(req.body);
  
  // Send a success response
  res.status(200).json({ success: true, message: 'Temperature data received and published' });
});

app.get('/api/temperature-data', (req, res) => {
  try {
    const data = getLatestTemperatureData();
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No temperature data available'
      });
    }
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error retrieving temperature data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving temperature data',
      error: error.message
    });
  }
});

/**
 * Starts the server
 */
// Add this near the top after the client setup
console.log('MQTT client created with broker URL:', process.env.BROKER_URL);

// Modify the startServer function
const startServer = () => {
  // Force immediate console output
  console.log('\n========== Starting Server ==========');
  console.log('Environment variables:', {
    BROKER_URL: process.env.BROKER_URL || 'not set',
    USER: process.env.USER ? 'set' : 'not set',
    PASSWORD: process.env.PASSWORD ? 'set' : 'not set'
  });

  app.listen(PORT, () => {
    console.log(`\nServer is running on http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/temperature-data`);
    console.log('\nWaiting for incoming requests...\n');
  });
};

export {
  publishTemperatureData,
  getLatestTemperatureData,
  subscribeToTemperatureUpdates,
  startServer
};
