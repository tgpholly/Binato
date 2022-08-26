const mysql = require("mysql2");
const consoleHelper = require("../consoleHelper.js");

module.exports = class {
	constructor(databaseAddress, databasePort = 3306, databaseUsername, databasePassword, databaseName, connectedCallback) {
		this.connectionPool = mysql.createPool({
			connectionLimit: 128,
			host: databaseAddress,
			port: databasePort,
			user: databaseUsername,
			password: databasePassword,
			database: databaseName
		});

		const classCreationTime = Date.now();
		this.dbActive = false;
		if (connectedCallback == null) {
			this.dbActive = true;
		} else {
			const connectionCheckInterval = setInterval(() => {
				this.query("SELECT name FROM osu_info LIMIT 1")
					.then(data => {
						consoleHelper.printBancho(`Connected to database. Took ${Date.now() - classCreationTime}ms`);
						this.dbActive = true;
						clearInterval(connectionCheckInterval);

						connectedCallback();
					})
					.catch(err => {});
			}, 167); // Roughly 6 times per sec
		}
	}

	query(query = "", data) {
		const limited = query.includes("LIMIT 1");

		return new Promise((resolve, reject) => {
			this.connectionPool.getConnection((err, connection) => {
				if (err) {
					reject(err);
					try { connection.release();}
					catch (e) {
						console.error("Failed to release mysql connection", err);
					}
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