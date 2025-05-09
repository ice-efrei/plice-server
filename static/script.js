const possible_characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,.';-:?#!\"$%&[]()<>@+=/\\{} ";

const fillChoices = () => {
    const parent = document.getElementById("choices");

    possible_characters.split('').forEach(character => {
        const child = document.createElement('div');
        child.innerText = character;
        parent.appendChild(child);
    });

};

let highlightedElement = null;

const zoomIn = e => {
    const removeHighlight = () => {
        document.querySelectorAll("[highlighted]").forEach(
            el => el.removeAttribute("highlighted")
        );
    }

    if (e.target.getAttribute("highlighted") != null || !e.target.classList.contains("case")) {
        removeHighlight();
        highlightedElement = null;
    } else {
        removeHighlight();
        e.target.setAttribute("highlighted", "");
        highlightedElement = e.target;
    }
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
