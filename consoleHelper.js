const chalk = require("chalk");

const LogType = {
	INFO: 0,
	WARN: 1,
	ERROR: 2
}

const LogTags = {
	BANCHO: chalk.bgMagenta(chalk.black(" BANCHO ")),
	WEBREQ: chalk.bgGreen(chalk.black(" WEBREQ ")),
	CHAT: chalk.bgCyan(chalk.black(" CHATTO ")),
	WARN: chalk.bgYellow(chalk.black(" WARNIN ")),
	ERROR: chalk.bgRed(" ERROR! "),
	REDIS: chalk.bgRed(chalk.white(" bREDIS "))
}

function correctValue(i) {
	if (i <= 9) return "0"+i;
	else return i;
}

function getTime() {
	const time = new Date();
	return chalk.green(`[${correctValue(time.getHours())}:${correctValue(time.getMinutes())}:${correctValue(time.getSeconds())}]`);
}

function log(tag = "", log = "", logType = LogType.INFO) {
	switch (logType) {
		case LogType.INFO:
			return console.log(`${getTime()} ${tag} ${log}`);
		case LogType.WARN:
			return console.warn(`${getTime()} ${tag} ${log}`);
		case LogType.ERROR:
			return console.error(`${getTime()} ${tag} ${log}`);
	}
}

module.exports = {
	printWebReq:function(s) {
		log(LogTags.WEBREQ, s);
	},
	
	printBancho:function(s) {
		log(LogTags.BANCHO, s);
	},

	printRedis:function(s) {
		log(LogTags.REDIS, s);
	},

	printChat:function(s) {
		log(LogTags.CHAT, s);
	},

	printWarn:function(s) {
		log(LogTags.WARN, chalk.yellow(s), LogType.WARN);
	},
	
	printError:function(s) {
		log(LogTags.ERROR, chalk.red(s), LogType.ERROR);
	}
}