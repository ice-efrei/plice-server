import http from 'http';
import fs from 'fs';
import sqlite from 'node:sqlite';

const host = '0.0.0.0';
const port = 8080;

const database = new sqlite.DatabaseSync('plicedata');

const dbInitialized = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='character';").all();

if (!dbInitialized) {
    database.exec("CREATE TABLE character(x INTEGER CHECK (x BETWEEN 0 AND 40), y INTEGER CHECK (y BETWEEN 0 AND 25), value TEXT CHECK (length(value) = 1), PRIMARY KEY (x, y) );");
    const createChar = database.prepare("INSERT INTO character(x, y, value) VALUES (?, ?, ?)");

    for (let x = 0; x < 40; x++) {
        for (let y = 0; y < 25; y++) {
            createChar.exec(x, y, " ");
        }
    }
}

const page = fs.readFileSync('index.html', 'utf-8');

const server = http.createServer((req, res) => {
    if (req.method == 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(page);
    }

    if (req.method == 'POST') {

    }
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
