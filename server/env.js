import { config } from 'dotenv';

const validateEnv = () => {
    config();

    const requiredEnvVars = ['PRODUCTION_PORT', 'TESTING_PORT', 'NODE_ENV'];
    requiredEnvVars.forEach((key) => {
        if (!process.env[key]) {
            console.error(`Missing required environment variable: ${key}`);
            process.exit(1);
        }
    });
};

export default validateEnv;