import chalk from "chalk";

enum LogType {
	INFO,
	WARN,
	ERROR
};

const LogTags = {
	BANCHO: chalk.bgMagenta(chalk.black(" BCHO ")),
	WEBREQ: chalk.bgGreen(chalk.black(" WEBR ")),
	CHAT: chalk.bgCyan(chalk.black(" CHAT ")),
	WARN: chalk.bgYellow(chalk.black(" WARN ")),
	ERROR: chalk.bgRed(" ERRR "),
	REDIS: chalk.bgRed(chalk.white(" RDIS "))
} as const;

function correctValue(i:number) : string {
	if (i <= 9) return `0${i}`;
	else return i.toString();
}

function getTime() : string {
	const time = new Date();
	return chalk.green(`[${correctValue(time.getHours())}:${correctValue(time.getMinutes())}:${correctValue(time.getSeconds())}]`);
}

function log(tag:string, log:string, logType:LogType = LogType.INFO) : void {
	switch (logType) {
		case LogType.INFO:
			return console.log(`${getTime()} ${tag} ${log}`);
		case LogType.WARN:
			return console.warn(`${getTime()} ${tag} ${log}`);
		case LogType.ERROR:
			return console.error(`${getTime()} ${tag} ${log}`);
	}
}

export class ConsoleHelper {
	public static printWebReq(s:string) : void {
		log(LogTags.WEBREQ, s);
	}

	public static printBancho(s:string) : void {
		log(LogTags.BANCHO, s);
	}

	public static printRedis(s:string) : void {
		log(LogTags.REDIS, s);
	}

	public static printChat(s:string) : void {
		log(LogTags.CHAT, s);
	}

	public static printWarn(s:string) : void {
		log(LogTags.WARN, s);
	}

	public static printError(s:string) : void {
		log(LogTags.ERROR, s);
	}
}