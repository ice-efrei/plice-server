import express, { json, static as serveStatic } from 'express';
import { createServer } from 'http';
import { config } from 'dotenv';
import { initDatabase, getScreenCharacters, updateCharacter, logChange, updateStudentTimestamp, createStudent } from './server/database.js';
import setupWebSocket from './server/websocket.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ejs from 'ejs';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config();

// Validate required environment variables
const requiredEnvVars = ['PRODUCTION_PORT', 'TESTING_PORT', 'NODE_ENV'];
requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        console.error(`Missing required environment variable: ${key}`);
        process.exit(1); // Exit the application if a required variable is missing
    }
});

const app = express();
const server = createServer(app);

// Use the appropriate port based on the environment
const port = process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_PORT : process.env.TESTING_PORT;

// Initialize database
initDatabase();

// In-memory screen
let screen = Array.from({ length: 24 }, () => Array(40).fill(" "));

// Load characters into memory
const loadScreen = () => {
    const screenChars = getScreenCharacters();
    screenChars.forEach((c) => {
        screen[c.y][c.x] = c.value;
    });
};
loadScreen();

// WebSocket setup
const { broadcastChange } = setupWebSocket(server, () => screen.map((row) => row.join("")).join(""));

// Middleware
app.use(json());
app.use(serveStatic(join(__dirname, 'static')));
app.engine('.html', ejs.__express);

// Routes
app.get('/', (_, res) => {
    res.render('index.html', { screen, x: 40, y: 24 });
});

app.post('/', (req, res) => {
    const { x, y, value, student } = req.body;

    if (typeof x !== 'number' || typeof y !== 'number' || typeof value !== 'string' || typeof student !== 'string') {
        return res.status(400).json({ status: "err", error: "Invalid input types" });
    }

    if (x < 0 || x >= 40 || y < 0 || y >= 24 || value.length !== 1) {
        return res.status(400).json({ status: "err", error: "Invalid input values" });
    }

    try {
        const studentExists = updateStudentTimestamp(student);
        if (!studentExists.changes) {
            createStudent(student);
        }

        updateCharacter(x, y, value);
        logChange(x, y, value, student);
        screen[y][x] = value;

        broadcastChange(x, y, value);
        res.json({ status: "ok" });
    } catch (error) {
        res.status(500).json({ status: "err", error: "Internal server error" });
    }
});

// Start server
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});