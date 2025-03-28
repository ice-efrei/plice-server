const dotenv = require('dotenv');
const sqlite = require('node:sqlite');
const express = require('express');
const { WebSocketServer } = require('ws');
const { createServer } = require('http');

dotenv.config();

const MINITEL_X = 40;
const MINITEL_Y = 25;

const port = 8080;
const possible_characters = "azertyuiopqsdfghjklmwxcvbnAZRTYUIOPQSDFGHJKLMWXCVBN1234567890,.';-:?#!\"$%&[]()<>@+=/\\{} ";

// In-memory screen, as it is fairely small
let screen = Array.from({ length: MINITEL_Y }, () => Array(40).fill(0));

const getScreenString = () => {
    let result = "";
    screen.forEach(line => {
        result += line.join("") + "";
    });

    return result;
}

const database = new sqlite.DatabaseSync('plicedata');

// Create and setup the DB if inexistant
const isDBInitialized = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='character';").all();

if (isDBInitialized.length == 0) {
    console.log("Creating DB...");
    let a = database.exec(`CREATE TABLE character(x INTEGER CHECK (x BETWEEN 0 AND ${MINITEL_X - 1}) NOT NULL, y INTEGER CHECK (y BETWEEN 0 AND ${MINITEL_Y - 1}) NOT NULL, value TEXT CHECK (length(value) = 1) NOT NULL, PRIMARY KEY (x, y) );`);
    let b = database.exec("CREATE TABLE student(id TEXT CHECK (length(id) = 8) PRIMARY KEY, last DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL);");
    let c = database.exec("CREATE TABLE log(id INTEGER PRIMARY KEY AUTOINCREMENT, x INTEGER NOT NULL, y INTEGER NOT NULL, value TEXT CHECK (LENGTH(value) = 1) NOT NULL, date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, student TEXT CHECK (length(student) = 8) NOT NULL, FOREIGN KEY (student) REFERENCES student(id), FOREIGN KEY (x, y) REFERENCES character(x, y));");
    const createChar = database.prepare("INSERT INTO character(x, y, value) VALUES (?, ?, ?)");
    
    for (let x = 0; x < MINITEL_X; x++) {
        for (let y = 0; y < MINITEL_Y; y++) {
            createChar.run(x, y, " ");
        }
    }

    console.log("DB created!");
}

// Loads the characters from the database into memory
let screenChars = database.prepare("SELECT x, y, value FROM character;").all();
screenChars.forEach(c => {
    screen[c.y][c.x] = c.value;
});

// Fast and secured database statments 
const log = database.prepare("INSERT INTO log(x, y, value, student) VALUES (?, ?, ?, ?);");
const setCharacter = database.prepare("UPDATE character SET value=? WHERE x=? AND y=?;");
const updateDate = database.prepare("UPDATE student SET last=? WHERE id=?");
const createStudent = database.prepare("INSERT INTO student(id) VALUES (?);");

const checkVals = (x, y, val) => {
    if (0 > x || MINITEL_X <= x)
        return false;

    if (0 > y || MINITEL_Y <= y)
        return false;

    if (val.length != 1)
        return false;

    if (!(possible_characters.includes(val))) {
        return false;
    }

    return true;
}

const change = (x, y, val, student) => {
    const now = Date.now();
    updateDate.run(now, student);
    setCharacter.run(val, x, y);
    log.run(x, y, val, student);
    screen[y][x] = val;

    const n = a => {
        return ("00" + a).slice(-2);
    }

    wss.clients.forEach(client => {
        // TXXYYV ex 10423a for 'a' at x=4 and y=23 (with type 1 = change letter)
        client.send(`1${n(x)}${n(y)}${val}`);
    });
}

// Initializes web server, simple websocket server for the screen and socket.io server for all users
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({server: server});

app.engine('.html', require('ejs').__express);

app.use(express.static('static'));

app.use(express.json());

app.get('/', (_, res) => {
    res.render('index.html', { screen: screen, error: { message: "my super page" }, x: MINITEL_X, y: MINITEL_Y });
});

app.post('/', (req, res) => {
    const now = Date.now();

    const getDate = database.prepare("SELECT last FROM student WHERE id=?");

    let placing = req.body;

    let x = placing.x;
    let y = placing.y;
    let value = placing.value;
    let student = placing.student;

    
    if (x == undefined || y == undefined || value == undefined || student == undefined) {
        
        res.json({ status: "err", error: "bro i need all fields" });
        return;
    }
    
    if (typeof x != "number" || typeof y != "number" || typeof value != "string" || typeof student != "string") {
        res.json({status: "err", error: "if you're really trying to reverse-engineer my API please at least send the right types"});
        return;
    }

    if (!checkVals(x, y, value)) {
        res.json({ status: "err", error: "oh nooo, i totally did not check that..." });
        return;
    }

    let last = getDate.get(student);
    
    if (last == undefined) {
        createStudent.run(student);
        last = 0;
    } else {
        last = last.last;
    }

    last = new Date(last).getTime();

    // if (now - last < 300000) {
    //     res.json({ status: "err", error: `too soon, try again in ${300 - Math.round((now - last) / 1000)} seconds` });
    //     return;
    // }

    change(x, y, value, student);

    res.json({status: "ok"});
});

app.all('*', (_, res) => {
    res.redirect('/');
});

wss.on('connection', socket => {
    // Send the map for any incoming message
    //! pretty DDoS-able, include minimal check (IP, secret... ?)
    console.log("Someone connected to broadcast");

    socket.on('message', e => {
        console.log(e);
        socket.send("0" + getScreenString());
    });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
