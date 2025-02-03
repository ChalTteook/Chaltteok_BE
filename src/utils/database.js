import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const database = {
    init: async () => {
        // return await mysql.createConnection(pool);
        return pool;
    },
    connect: async () => {
        try {
            const connection = await pool.getConnection();
            console.log("mysql connection success");
            connection.release();
        } catch (err) {
            console.error("mysql connection error:", err);
        }
    }
};

export default database;