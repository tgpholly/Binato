export default class LoginInfo {
	public username:string;
	public password:string;
	public version:string;
	public timeOffset:number;
	// TODO: Parse client data
	public clientData:string;

	private constructor(username:string, password:string, version:string, timeOffset:number, clientData:string) {
		this.username = username;
		this.password = password;
		this.version = version;
		this.timeOffset = timeOffset;
		this.clientData = clientData;
	}

	public static From(data:Buffer | string) : LoginInfo | undefined {
		if (data instanceof Buffer) {
			data = data.toString();
		}

		const loginData:Array<string> = data.split("\n");
		const extraData:Array<string> = loginData[2].split("|");

		if (loginData.length !== 4 || extraData.length !== 5) {
			return undefined;
		}

		// TODO: Parse client data

		return new LoginInfo(loginData[0], loginData[1], extraData[0], parseInt(extraData[1]), extraData[3].split(":")[2]);
	}
}