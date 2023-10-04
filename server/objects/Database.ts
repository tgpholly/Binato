import { ConsoleHelper } from "../../ConsoleHelper";
import { createPool, Pool, RowDataPacket } from "mysql2";
import { DBInDataType } from "../types/DBTypes";

export default class Database {
	private connectionPool:Pool;
	private static readonly CONNECTION_LIMIT = 128;

	public connected:boolean = false;

	public constructor(databaseAddress:string, databasePort:number = 3306, databaseUsername:string, databasePassword:string, databaseName:string) {
		this.connectionPool = createPool({
			connectionLimit: Database.CONNECTION_LIMIT,
			host: databaseAddress,
			port: databasePort,
			user: databaseUsername,
			password: databasePassword,
			database: databaseName
		});

		ConsoleHelper.printInfo(`Connected DB connection pool. MAX_CONNECTIONS = ${Database.CONNECTION_LIMIT}`);
	}

	public execute(query:string, data?:Array<DBInDataType>) {
		return new Promise<boolean>((resolve, reject) => {
			this.connectionPool.getConnection((err, connection) => {
				if (err) {
					return reject(err);
				}

				if (data == null) {
					connection.execute(query, data, (err, result) => {
						if (err) {
							connection.release();
							return reject(err);
						}
	
						resolve(result !== undefined);
					});
				} else {

				}
			});
		});
	}

	public query(query:string, data?:Array<DBInDataType>) {
		return new Promise<RowDataPacket[]>((resolve, reject) => {
			this.connectionPool.getConnection((err, connection) => {
				if (err) {
					return reject(err);
				} else {
					// Use old query
					if (data == null) {
						connection.query<RowDataPacket[]>(query, (err, rows) => {
							connection.release();
							if (err) {
								return reject(err);
							}

							resolve(rows);
							connection.release();
						});
					}
					// Use new prepared statements w/ placeholders
					else {
						connection.execute<RowDataPacket[]>(query, data, (err, rows) => {
							connection.release();
							if (err) {
								return reject(err);
							}

							resolve(rows);
							connection.release();
						});
					}
				}
			});
		});
	}

	public async querySingle(query:string, data?:Array<DBInDataType>) {
		const dbData = await this.query(query, data);
		if (dbData != null && dbData.length > 0) {
			return dbData[0];
		}

		return null;
	}
}