const possible_characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,.';-:?#!\"$%&[]()<>@+=/\\{} ";

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const cellSize = 40;
const totalCols = 40;
const totalRows = 28;

let offsetX = 0;
let offsetY = 0;

// Stocke lettres dans chaque case : clé "col,row" → lettre
const cellLetters = {};
let selectedCell = null;

let isDragging = false;
let startX = 0, startY = 0;

const viewport = document.getElementById('viewport');

function resizeCanvas() {
    const rect = viewport.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawGrid();
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colsVisible = Math.ceil(canvas.width / cellSize);
    const rowsVisible = Math.ceil(canvas.height / cellSize);

    const startCol = Math.floor(offsetX / cellSize);
    const startRow = Math.floor(offsetY / cellSize);

    const offsetXMod = offsetX % cellSize;
    const offsetYMod = offsetY % cellSize;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner lettres dans la zone visible
    ctx.fillStyle = '#ffffff'; // lettres en blanc pour contraster fond noir
    ctx.font = `${cellSize * 0.7}px 'Ubuntu Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let row = startRow; row < startRow + rowsVisible; row++) {
        if (row >= totalRows) continue;
        for (let col = startCol; col < startCol + colsVisible; col++) {
            if (col >= totalCols) continue;
            const key = `${col},${row}`;
            const letter = cellLetters[key];
            if (letter) {
                const x = (col - startCol) * cellSize + cellSize / 2 - offsetXMod;
                const y = (row - startRow) * cellSize + cellSize / 2 - offsetYMod;
                ctx.fillText(letter, x, y);
            }
        }
    }

    ctx.strokeStyle = "#555"; // couleur grille
    ctx.lineWidth = 1;

    for (let col = 0; col <= colsVisible; col++) {
        const x = col * cellSize - offsetXMod;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let row = 0; row <= rowsVisible; row++) {
        const y = row * cellSize - offsetYMod;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // highlight case selectionnée
    if (selectedCell) {
        const { col, row } = selectedCell;
        if (
            col >= startCol && col < startCol + colsVisible &&
            row >= startRow && row < startRow + rowsVisible
        ) {
            const x = (col - startCol) * cellSize - offsetXMod;
            const y = (row - startRow) * cellSize - offsetYMod;
            ctx.strokeStyle = '#87CEFA';
            ctx.lineWidth = 3;
            ctx.strokeRect(x + 1.5, y + 1.5, cellSize - 3, cellSize - 3);
        }
    }
}

function clampOffsets() {
    const maxOffsetX = totalCols * cellSize - canvas.width;
    const maxOffsetY = totalRows * cellSize - canvas.height;
    offsetX = Math.max(0, Math.min(offsetX, maxOffsetX));
    offsetY = Math.max(0, Math.min(offsetY, maxOffsetY));
}

// Drag souris
viewport.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});
window.addEventListener("mouseup", () => {
    isDragging = false;
});
window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    offsetX -= dx;
    offsetY -= dy;
    clampOffsets();
    drawGrid();
});

// Selection case en click
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const col = Math.floor((offsetX + mouseX) / cellSize);
    const row = Math.floor((offsetY + mouseY) / cellSize);

    if (col >= 0 && col < totalCols && row >= 0 && row < totalRows) {
        // Si on clique sur la même case déjà sélectionnée, on la désélectionne
        if (selectedCell && selectedCell.col === col && selectedCell.row === row) {
            selectedCell = null;
        } else {
            selectedCell = { col, row };
        }
    } else {
        // Clique hors de la grille : désélectionner
        selectedCell = null;
    }
    drawGrid();
});

window.addEventListener('keydown', (e) => {
    if (!selectedCell) return;

    const char = e.key;
    if (char.length === 1 && possible_characters.includes(char)) {
        const key = `${selectedCell.col},${selectedCell.row}`;
        cellLetters[key] = char;
        drawGrid();
    }
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener('DOMContentLoaded', resizeCanvas);

resizeCanvas();


window.onload = () => {
    fillChoices();

    // sélection case
    document.body.onclick = zoomIn;
    window.addEventListener('keydown', (e) => {
        if (highlightedElement && possible_characters.includes(e.key)) {
            highlightedElement.innerText = e.key;

            const x = parseInt(highlightedElement.getAttribute('x'));
            const y = parseInt(highlightedElement.getAttribute('y'));

            postLetter(x, y, e.key);
        }
    });
};


window.onload = _ => {
    console.log("%cPour tous les skids et les wannabe hackers venus dans la console", "color: red; font-size: 20px; font-weight: bolder;");
    console.log("%cSi tu penses pouvoir pirater ce service, stp non en fait c'est juste un projet étudiant et tout casser c'est pas drôle", "font-weight: bolder");
    console.log("%cSi tu penses pouvoir DDoS ce service, c'est effectivement possible mais vraiment lourd", "font-weight: bolder;");
    console.log("%cSi tu penses être très intelligent et reverse-engineer le script, ça ne sert à rien tout est open-source sur notre Github à l'addresse https://github.com/ice-efrei/plice-server", "font-weight: bolder;");
    console.log("%cSi tu as tout lu et que tu souhaite finalement être sympa et ajouter des features, je t'invite à rejoindre l'association %cICE %cici : https://discord.gg/uP7UffaqCp (c'est 5€ et on est marrants)", "font-weight: bolder;", "font-weight: bolder; color:  #3498db;", "font-weight: bolder;");
    
    document.body.onkeydown = e => {
        if (highlightedElement && possible_characters.includes(e.key)) {
            const x = parseInt(highlightedElement.getAttribute("x"));
            const y = parseInt(highlightedElement.getAttribute("y"));
            postLetter(x, y, e.key);
        }
    }

    document.body.onclick = zoomIn;

    fillChoices();

    const ws = new WebSocket(`ws://${window.location.host}/`);

    ws.onmessage = (e) => {
        const type = e.data[0];
        if (type === "0") {
            resetScreen(e.data.slice(1));
        } else if (type === "1") {
            const x = parseInt(e.data.slice(1, 3));
            const y = parseInt(e.data.slice(3, 5));
            const value = e.data[5];
            updateCell(x, y, value);
        }
    };
};

const updateCell = (x, y, value) => {
    const cell = document.querySelector(`.case[x="${x}"][y="${y}"]`);
    if (cell) cell.innerText = value;
};

const resetScreen = (data) => {
    // Logic to reset the screen
};

const ok = () => {
    console.log("ok");
};

const err = error => {
    console.log(error);
};

const postLetter = (x, y, value) => {
    fetch("/", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y, value, student: "20231234" }),
    })
        .then((res) => res.json())
        .then((result) => {
            if (result.status !== "ok") console.error(result.error);
        });
};
