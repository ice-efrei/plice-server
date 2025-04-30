const initializeScreen = (getScreenCharacters) => {
    const screen = Array.from({ length: 24 }, () => Array(40).fill(" "));
    const screenChars = getScreenCharacters();
    screenChars.forEach((c) => {
        screen[c.y][c.x] = c.value;
    });
    return screen;
};

export default initializeScreen;