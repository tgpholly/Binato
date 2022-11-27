export interface Config {
	express:ExpressConfigSection,
	prometheus:PrometheusConfigSection,
	redis:RedisConfigSection,
	database:DatabaseConfigSection
}

interface ExpressConfigSection {
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