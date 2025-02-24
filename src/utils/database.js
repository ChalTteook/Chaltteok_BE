import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const server = process.env.MODE;
let dbConfig;

if (server === 'DEV') {
    dbConfig = {
        host: process.env.DEV_DB_HOST,
        user: process.env.DEV_DB_USER,
        password: process.env.DEV_DB_PASSWORD,
        database: process.env.DEV_DB_NAME,
        port: process.env.DEV_DB_PORT,
    };
} else if (server === 'PROD') {
    dbConfig = {
        host: process.env.PROD_DB_HOST,
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASSWORD,
        database: process.env.PROD_DB_NAME,
        port: process.env.PROD_DB_PORT,
    };
} else { // Default to local
    dbConfig = {
        host: process.env.LOCAL_DB_HOST,
        user: process.env.LOCAL_DB_USER,
        password: process.env.LOCAL_DB_PASSWORD,
        database: process.env.LOCAL_DB_NAME,
        port: process.env.LOCAL_DB_PORT,
    };
}

const pool = mysql.createPool({
    ...dbConfig,
    dateStrings: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    waitForConnections: true,
    connectTimeout: 10000
});

// export default database;
export {
    pool
}