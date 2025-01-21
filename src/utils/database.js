import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'test1234',
    database: 'chaltteok',
    port: 3306
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