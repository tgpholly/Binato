import { Console } from "hsconsole";
import { createPool, type Pool } from "mariadb";

export type DBInDataType = string | number | Date | null | undefined;

export default class Database {
	private connectionPool: Pool;
	private static readonly CONNECTION_LIMIT = 128;

	public static Instance: Database;

	public constructor(databaseAddress: string, databasePort: number = 3306, databaseUsername: string, databasePassword: string, databaseName: string) {
		this.connectionPool = createPool({
			connectionLimit: Database.CONNECTION_LIMIT,
			host: databaseAddress,
			port: databasePort,
			user: databaseUsername,
			password: databasePassword,
			database: databaseName
		});

		Console.printInfo(`DB connection pool created. MAX_CONNECTIONS = ${Database.CONNECTION_LIMIT}`);

		Database.Instance = this;
	}

	public async execute(query: string, data?: Array<DBInDataType>) {
		try {
			const connection = await this.connectionPool.getConnection();
			if (connection == null) {
				return false;
			}

			if (data == null) {
				const result = await connection.execute(query);
				await connection.release();
				return result !== undefined;
			} else {
				const result = await connection.execute(query, data);
				await connection.release();
				return result !== undefined;
			}
		} catch (e) {
			Console.printError(`MultiProbe server repository error:\n${e}`);
			throw e;
		}
	}

	public async query(query: string, data?: Array<DBInDataType>) {
		try {
			const connection = await this.connectionPool.getConnection();
			if (connection == null) {
				return null;
			}

			if (data == null) {
				const result = await connection.query(query);
				await connection.release();
				return result;
			} else {
				const result = await connection.query(query, data);
				await connection.release();
				return result;
			}
		} catch (e) {
			Console.printError(`MultiProbe server repository error:\n${e}`);
			throw e;
		}
	}
}
