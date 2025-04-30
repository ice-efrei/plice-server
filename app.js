import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import validateEnv from './server/env.js';
import setupMiddlewares from './server/middleware.js';
import setupRoutes from './server/routes.js';
import setupWebSocket from './server/websocket.js';
import { initDatabase, getScreenCharacters, updateCharacter, logChange, updateStudentTimestamp, createStudent } from './server/database.js';
import initializeScreen from './server/screen.js';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate environment variables
validateEnv();

const app = express();
const server = createServer(app);

// Use the appropriate port based on the environment
const port = process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_PORT : process.env.TESTING_PORT;

// Initialize database
initDatabase();

// Setup middlewares
setupMiddlewares(app, __dirname);

// Initialize screen
let screen = initializeScreen(getScreenCharacters);

// WebSocket setup
const { broadcastChange } = setupWebSocket(server, () => screen.map((row) => row.join("")).join(""));

// Setup routes
setupRoutes(app, screen, { updateStudentTimestamp, createStudent, updateCharacter, logChange, broadcastChange });

// Start server
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});