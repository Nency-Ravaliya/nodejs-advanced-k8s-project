const redis = require('redis');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Function to create Redis client with retries
function createRedisClient() {
  const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
  });

  client.on('connect', () => {
    console.log('Connected to Redis');
  });

  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  return client;
}

// Initialize Redis client
let redisClient = createRedisClient();

app.use(bodyParser.json());

// Define routes and application logic
app.get('/', async (req, res) => {
  try {
    // Check if Redis client is connected before using
    if (!redisClient.connected) {
      // Attempt to reconnect if not connected
      redisClient = createRedisClient();
      throw new Error('Redis client is not connected');
    }

    const visits = await redisClient.get('visits');
    if (visits) {
      await redisClient.set('visits', parseInt(visits) + 1);
    } else {
      await redisClient.set('visits', 1);
    }
    res.send(`Hello, World! You are visitor number ${parseInt(visits) + 1}`);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
