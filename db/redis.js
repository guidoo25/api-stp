import { createClient } from 'redis';
import { redis } from '../config/config.js';

// Initialize the Redis client
let client = createClient({
  url: redis
  
});

// Handle client errors
client.on('error', (err) => console.log('Redis Client Error', err));

// Function to get the Redis client
export async function getRedisClient() {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function setValue(key, value) {
  try {
    const client = await getRedisClient();
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new Error('Both key and value must be strings');
    }
    await client.set(key, value);
    console.log('Value set successfully');
  } catch (error) {
    console.error('Error setting value in Redis:', error);
  }
}

export async function getValue(key) {
  try {
    const client = await getRedisClient();
    const value = await client.get(key);
    return value;
  } catch (error) {
    console.error('Error retrieving value from Redis:', error);
    return null; 
  }
}

export async function getKeys(pattern) {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    return keys;
  } catch (error) {
    console.error('Error retrieving keys from Redis:', error);
    return []; 
  }
}

export async function deleteValue(key) {
  try {
    const client = await getRedisClient();
    const result = await client.del(key);
    if (result === 1) {
      console.log(`Valor ${key} eliminado satisfactoriamente.`);
      return true; // Indica éxito
    } else {
      console.log(`No se encontró el valor ${key} para eliminar.`);
      return false; // Indica que el valor no existía
    }
  } catch (error) {
    console.error('Error deleting value from Redis:', error);
    return false; // Indica error
  }
}

export async function flushAll() {
  try {
    const client = await getRedisClient();
    await client.flushAll();
    console.log('All keys have been deleted from Redis');
  } catch (error) {
    console.error('Error flushing all keys from Redis:', error);
  }
}


export async function disconnectRedisClient() {
  if (client && client.isOpen) {
    await client.disconnect();
    client = null;
  }
}
