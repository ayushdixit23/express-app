import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates that required environment variables are present
 * @param key - The environment variable key
 * @param defaultValue - Optional default value
 * @returns The environment variable value or default
 */
const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not defined`);
  }
  
  return value;
};

/**
 * Validates and parses port number
 */
const getPort = (): number => {
  const port = process.env.PORT || '5000';
  const parsedPort = parseInt(port, 10);
  
  if (isNaN(parsedPort) || parsedPort < 0 || parsedPort > 65535) {
    throw new Error(`Invalid PORT value: ${port}. Must be a number between 0 and 65535`);
  }
  
  return parsedPort;
};

// Environment Configuration
export const PORT = getPort();
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MONGO_URI = getEnvVariable('MONGO_URI');

// CORS Configuration
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

// Rate Limiting Configuration
export const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '400', 10);

console.log('✅ Environment variables loaded successfully');
console.log(`📍 Environment: ${NODE_ENV}`);
console.log(`🚀 Port: ${PORT}`);