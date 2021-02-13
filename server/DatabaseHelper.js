const mysql = require("mysql");

module.exports = class {
    constructor(databaseAddress, databasePort = 3306, databaseUsername, databasePassword, databaseName) {
        this.connectionPool = mysql.createPool({
            connectionLimit: 128,
            host: databaseAddress,
            port: databasePort,
            user: databaseUsername,
            password: databasePassword,
            database: databaseName
        });
    }

    async query(sqlQuery) {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    connection.release();
                } else {
                    connection.query(sqlQuery, (err, data) => {
                        if (err) {
                            reject(err);
                            connection.release();
                        } else {
                            if (sqlQuery.includes("LIMIT 1")) resolve(data[0]);
                            else resolve(data);
                            connection.release();
                        }
                    });
                }
            });
        });
    }
}