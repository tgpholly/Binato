const mysql = require("mysql2");

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

	query(query = "", data) {
		const limited = query.includes("LIMIT 1");

		return new Promise((resolve, reject) => {
			this.connectionPool.getConnection((err, connection) => {
				if (err) {
					reject(err);
					connection.release();
				} else {
					// Use old query
					if (data == null) {
						connection.query(query, (err, data) => {
							if (err) {
								reject(err);
								connection.release();
							} else {
								dataReceived(resolve, data, limited);
								connection.release();
							}
						});
					}
					// Use new prepared statements w/ placeholders
					else {
						connection.execute(query, data, (err, data) => {
							if (err) {
								reject(err);
								connection.release();
							} else {
								dataReceived(resolve, data, limited);
								connection.release();
							}
						});
					}
				}
			});
		});
	}
}

function dataReceived(resolveCallback, data, limited = false) {
	if (limited) resolveCallback(data[0]);
	else resolveCallback(data);
}