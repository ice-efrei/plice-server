const sqlite = require('node:sqlite');
const express = require('express');

const port = 8080;

const database = new sqlite.DatabaseSync('plicedata');

const dbInitialized = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='character';").all();

if (!dbInitialized) {
    database.exec("CREATE TABLE character(x INTEGER CHECK (x BETWEEN 0 AND 40) NOT NULL, y INTEGER CHECK (y BETWEEN 0 AND 25) NOT NULL, value TEXT CHECK (length(value) = 1) NOT NULL, PRIMARY KEY (x, y) );");
    database.exec("CREATE TABLE log(id INTEGER PRIMARY KEY AUTOINCREMENT, x INTEGER NOT NULL, y INTEGER NOT NULL, value TEXT CHECK (LENGTH(value) = 1) NOT NULL, date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, student TEXT CHECK (length(student) = 8) NOT NULL, FOREIGN KEY (x) REFERENCES character(x), FOREIGN KEY (y) REFERENCES character(y));");
    const createChar = database.prepare("INSERT INTO character(x, y, value) VALUES (?, ?, ?)");

    for (let x = 0; x < 40; x++) {
        for (let y = 0; y < 25; y++) {
            createChar.exec(x, y, " ");
        }
    }
}

const app = express();

app.engine('.html', require('ejs').__express);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index.html', {});
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
