/**
 * Publisher module for handling temperature data from the farm
 */
import express from 'express';
import cors from 'cors';

// Mock API endpoint for demonstration
const API_ENDPOINT = 'https://api.henhouse-manager.com/temperature-data';
const app = express();
const PORT = 3000;

// Configure Express
app.use(cors());
app.use(express.json());

// In-memory storage for temperature data
let temperatureDataStorage = null;

/**
 * Publishes temperature data to external systems
 * @param {Object} data - Temperature data object from sensors
 */
const publishTemperatureData = (data) => {
  // Format timestamp for better readability
  const timestamp = new Date(data.timestamp).toLocaleString();
  
  // Create formatted temperature readings
  const readings = [
    `Coop A: corner=${data.coopA.corner}°C, center=${data.coopA.center}°C`,
    `Coop B: corner=${data.coopB.corner}°C, center=${data.coopB.center}°C`,
    `Coop C: center=${data.coopC.center}°C`,
    `Ventilation: main=${data.ventilation.main}°C, secondary=${data.ventilation.secondary}°C, east=${data.ventilation.east}°C`,
    `Processing: egg washing=${data.processing.eggWashing}°C, storage=${data.processing.eggStorage}°C`
  ];

  // Log to terminal with formatting
  console.log('\n=== Temperature Data Received ===');
  console.log(`Timestamp: ${timestamp}`);
  readings.forEach(reading => console.log(reading));
  console.log('==============================\n');
  
  // Store data in memory for persistence
  temperatureDataStorage = data;
  
  // Node.js doesn't have window or CustomEvent
  // Removed browser-specific event dispatching
  
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
  try {
    const temperatureData = req.body;
    
    // Format timestamp for better readability
    const timestamp = new Date(temperatureData.timestamp).toLocaleString();
    
    // Create formatted temperature readings
    const readings = [
      `Coop A: corner=${temperatureData.coopA.corner}°C, center=${temperatureData.coopA.center}°C`,
      `Coop B: corner=${temperatureData.coopB.corner}°C, center=${temperatureData.coopB.center}°C`,
      `Coop C: center=${temperatureData.coopC.center}°C`,
      `Ventilation: main=${temperatureData.ventilation.main}°C, secondary=${temperatureData.ventilation.secondary}°C, east=${temperatureData.ventilation.east}°C`,
      `Processing: egg washing=${temperatureData.processing.eggWashing}°C, storage=${temperatureData.processing.eggStorage}°C`
    ];

    // Log to terminal with formatting
    console.log('\n=== Temperature Data Received ===');
    console.log(`Timestamp: ${timestamp}`);
    readings.forEach(reading => console.log(reading));
    console.log('==============================\n');
    
    // Use the publisher module to handle the data
    const result = publishTemperatureData(temperatureData);
    
    res.status(200).json({ 
      success: true, 
      message: 'Temperature data received successfully',
      data: result
    });
  } catch (error) {
    console.error('Error processing temperature data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing temperature data',
      error: error.message
    });
  }
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
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Simulator backend running on http://localhost:${PORT}`);
    console.log(`Temperature data endpoint: POST http://localhost:${PORT}/api/temperature-data`);
  });
};

export {
  publishTemperatureData,
  getLatestTemperatureData,
  subscribeToTemperatureUpdates,
  startServer
};
