const setupRoutes = (app, screen, { updateStudentTimestamp, createStudent, updateCharacter, logChange, broadcastChange }) => {
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
            res.status(500).json({ status: "err", error: "OOF internal server goes :(" });
        }
    });
};

export default setupRoutes;