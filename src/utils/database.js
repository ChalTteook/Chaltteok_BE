import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const server = process.env.MODE;

const pool = mysql.createPool({
    host: server == 'dev' ? process.env.DEV_DB_HOST : process.env.LOCAL_DB_HOST,
    user:  server == 'dev' ? process.env.DEV_DB_USER : process.env.LOCAL_DB_USER,
    password: server == 'dev' ? process.env.DEV_DB_PASSWORD : process.env.LOCAL_DB_PASSWORD,
    database: server == 'dev' ? process.env.DEV_DB_NAME : process.env.LOCAL_DB_NAME,
    port: server == 'dev' ? process.env.DEV_DB_PORT : process.env.LOCAL_DB_PORT,
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