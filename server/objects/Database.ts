import { ConsoleHelper } from "../../ConsoleHelper";
import { createPool, Pool } from "mysql2";

export class Database {
	private connectionPool:Pool;
	private static readonly CONNECTION_LIMIT = 128;

	public connected:boolean = false;

	public constructor(databaseAddress:string, databasePort:number = 3306, databaseUsername:string, databasePassword:string, databaseName:string, connectedCallback:Function) {
		this.connectionPool = createPool({
			connectionLimit: Database.CONNECTION_LIMIT,
			host: databaseAddress,
			port: databasePort,
			user: databaseUsername,
			password: databasePassword,
			database: databaseName
		});

		const classCreationTime:number = Date.now();
		let lastQueryFinished = true;
		const connectionCheckInterval = setInterval(() => {
			if (lastQueryFinished) {
				lastQueryFinished = false;
				this.query("SELECT name FROM osu_info LIMIT 1")
				.then(data => {
					if (!this.connected) {
						this.connected = true;
						ConsoleHelper.printInfo(`Connected to database. Took ${Date.now() - classCreationTime}ms`);
						clearInterval(connectionCheckInterval);
						lastQueryFinished = true;

						connectedCallback();
					}
				})
				.catch(err => {
					lastQueryFinished = true;
				});
			}
		}, 16);
	}

	public query(query = "", data?:Array<any>) {
		const limited = query.includes("LIMIT 1");

		return new Promise<any>((resolve, reject) => {
			this.connectionPool.getConnection((err, connection) => {
				if (err) {
					reject(err);
					try {
						connection.release();
					} catch (e) {
						ConsoleHelper.printError("Failed to release mysql connection\n" + err);
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

function dataReceived(resolveCallback:(value:unknown) => void, data:any, limited:boolean = false) : void {
	if (limited) resolveCallback(data[0]);
	else resolveCallback(data);
}