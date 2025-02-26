const possible_characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,.';-:?#!\"$%&[]()<>@+=/\\{} ";

const fillChoices = () => {
    const parent = document.getElementById("choices");

    possible_characters.split('').forEach(character => {
        const child = document.createElement('div');
        child.innerText = character;
        parent.appendChild(child);
    });

}

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
}

window.onload = _ => {
    document.body.onkeydown = e => {
        if (highlightedElement != null) {
            if (!possible_characters.includes(e.key))
                return;

            // e.preventDefault();
            highlightedElement.innerText = e.key;
        }
    }

    document.body.onclick = zoomIn;

    fillChoices();
}
