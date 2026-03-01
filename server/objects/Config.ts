import { existsSync, readFileSync } from "fs";
import ConsoleHelper from "../../ConsoleHelper";

if (!existsSync("./config.json")) {
	ConsoleHelper.printError("Config file missing!");
	ConsoleHelper.printError("Check the GitHub for an example or create one with the example you have.");
	process.exit(1);
}

const config = JSON.parse(readFileSync("./config.json").toString());

export default abstract class Config {
	public static http: HttpConfigSection = config.http;
	public static prometheus: PrometheusConfigSection = config.prometheus;
	public static redis: RedisConfigSection = config.redis;
	public static database: DatabaseConfigSection = config.database;
}

interface HttpConfigSection {
	port:number,
	compression:boolean
}

interface PrometheusConfigSection {
	enabled:boolean,
	port:number
}

interface RedisConfigSection {
	enabled:boolean,
	address:string,
	port:number,
	database:number,
	password:string
}

interface DatabaseConfigSection {
	address:string,
	port:number,
	username:string,
	password:string,
	name:string,
	pbkdf2:PBKDF2DatabaseConfigSection,
	key:string
}

interface PBKDF2DatabaseConfigSection {
	itterations:number,
	keylength:number
}