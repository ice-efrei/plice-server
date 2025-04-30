import ratelimit from 'express-rate-limit';
import { json, static as serveStatic } from 'express';
import { join } from 'path';
import ejs from 'ejs';

const setupMiddlewares = (app, __dirname) => {
    // Rate limiting middleware
    const limiter = ratelimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50, // Limit each IP to 50 requests per windowMs
        message: "Tu te calmes deux minutes ?",
    });

    app.use(limiter); // Apply rate limiting
    app.use(json()); // Parse JSON requests
    app.use(serveStatic(join(__dirname, 'static'), {
        maxAge: 86400, // Cache static files for 1 day
    }));
    app.engine('.html', ejs.__express); // Set EJS as the template engine

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ status: "err", error: "Internal Server Error" });
    });
};

export default setupMiddlewares;