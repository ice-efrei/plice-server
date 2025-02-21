const zoomIn = e => {
    const removeHighlight = () => {
        document.querySelectorAll("[highlighted]").forEach(
            el => el.removeAttribute("highlighted")
        );
    }

    if (e.getAttribute("highlighted") != null) {
        removeHighlight();
    } else {
        removeHighlight();
        e.setAttribute("highlighted", "");
        e.addEventListener("keydown", ev => {
            console.log(ev);
            
        })
    }
}