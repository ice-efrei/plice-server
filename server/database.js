const sqlite = require('better-sqlite3'); // Use better-sqlite3 for simplicity and performance
const path = require('path');

const db = new sqlite(path.resolve(__dirname, 'plicedata'));

// Initialize the database
const initDatabase = () => {
    const isDBInitialized = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='character';").all();

    if (isDBInitialized.length === 0) {
        console.log("Creating DB...");
        db.exec(`
            CREATE TABLE character (
                x INTEGER CHECK (x BETWEEN 0 AND 39) NOT NULL,
                y INTEGER CHECK (y BETWEEN 0 AND 23) NOT NULL,
                value TEXT CHECK (length(value) = 1) NOT NULL,
                PRIMARY KEY (x, y)
            );
            CREATE TABLE student (
                id TEXT CHECK (length(id) = 8) PRIMARY KEY,
                last DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
            CREATE TABLE log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                x INTEGER NOT NULL,
                y INTEGER NOT NULL,
                value TEXT CHECK (LENGTH(value) = 1) NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                student TEXT CHECK (length(student) = 8) NOT NULL,
                FOREIGN KEY (student) REFERENCES student(id),
                FOREIGN KEY (x, y) REFERENCES character(x, y)
            );
        `);

        const createChar = db.prepare("INSERT INTO character(x, y, value) VALUES (?, ?, ?)");
        for (let x = 0; x < 40; x++) {
            for (let y = 0; y < 24; y++) {
                createChar.run(x, y, " ");
            }
        }
        console.log("DB created!");
    }
};

// Database operations
const getScreenCharacters = () => db.prepare("SELECT x, y, value FROM character;").all();
const updateCharacter = (x, y, value) => db.prepare("UPDATE character SET value=? WHERE x=? AND y=?;").run(value, x, y);
const logChange = (x, y, value, student) => db.prepare("INSERT INTO log(x, y, value, student) VALUES (?, ?, ?, ?);").run(x, y, value, student);
const updateStudentTimestamp = (student) => db.prepare("UPDATE student SET last=CURRENT_TIMESTAMP WHERE id=?;").run(student);
const createStudent = (student) => db.prepare("INSERT INTO student(id) VALUES (?);").run(student);

module.exports = {
    initDatabase,
    getScreenCharacters,
    updateCharacter,
    logChange,
    updateStudentTimestamp,
    createStudent,
};