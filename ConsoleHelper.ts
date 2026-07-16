import * as dyetty from "dyetty";

console.clear();

enum LogType {
	INFO,
	WARN,
	ERROR
}

const LogTags = {
	INFO: dyetty.bgGreen(dyetty.black("  INFO  ")),
	BANCHO: dyetty.bgMagenta(dyetty.black(" BANCHO ")),
	WEBREQ: dyetty.bgGreen(dyetty.black(" WEBREQ ")),
	CHAT: dyetty.bgCyan(dyetty.black("  CHAT  ")),
	WARN: dyetty.bgYellow(dyetty.black("  WARN  ")),
	ERROR: dyetty.bgRed("  ERRR  "),
	REDIS: dyetty.bgRed(dyetty.white(" bREDIS ")),
	STREAM: dyetty.bgBlue(dyetty.black(" STREAM "))
} as const;

function correctValue(i: number) : string {
	if (i <= 9) return `0${i}`;
	else return i.toString();
}

function getTime() : string {
	const time = new Date();
	return dyetty.green(`[${correctValue(time.getHours())}:${correctValue(time.getMinutes())}:${correctValue(time.getSeconds())}]`);
}

function log(tag: string, log: string, logType: LogType = LogType.INFO) : void {
	switch (logType) {
		case LogType.INFO:
			return console.log(`${getTime()} ${tag} ${log}`);
		case LogType.WARN:
			return console.warn(`${getTime()} ${tag} ${log}`);
		case LogType.ERROR:
			return console.error(`${getTime()} ${tag} ${log}`);
	}
}

function formatType(typ: any) {
	if (typ instanceof Error) {
		let text = typ.stack ?? `${typ.name}: ${typ.message}`;
		if (typ.cause) {
			text += `\nCaused by: ${formatType(typ.cause)}`;
		}
		return text;
	}

	return typ;
}

export default class ConsoleHelper {
	public static printWebReq(s: any) : void {
		log(LogTags.WEBREQ, formatType(s));
	}

	public static printStream(s: any) : void {
		log(LogTags.STREAM, formatType(s));
	}

	public static printInfo(s: any) : void {
		log(LogTags.INFO, formatType(s));
	}

	public static printBancho(s: any) : void {
		log(LogTags.BANCHO, formatType(s));
	}

	public static printRedis(s: any) : void {
		log(LogTags.REDIS, formatType(s));
	}

	public static printChat(s: any) : void {
		log(LogTags.CHAT, formatType(s));
	}

	public static printWarn(s: any) : void {
		log(LogTags.WARN, formatType(s));
	}

	public static printError(s: any) : void {
		log(LogTags.ERROR, formatType(s));
	}
}