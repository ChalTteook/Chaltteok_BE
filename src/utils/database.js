import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const server = process.env.MODE;

const pool = mysql.createPool({
    host: server == 'local' ? process.env.DEV_DB_HOST : process.env.PROD_DB_HOST,
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    port: process.env.PROD_DB_PORT,
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