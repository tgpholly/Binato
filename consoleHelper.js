const chalk = require("chalk");

module.exports = {
    printWebReq:function(s) {
        console.log(`${this.getTime()} ${chalk.bgGreen(chalk.black(" WEBREQ "))} ${s}`);
    },
    
    printBancho:function(s) {
        console.log(`${this.getTime()} ${chalk.bgMagenta(chalk.black(" BANCHO "))} ${s}`);
    },

    printChat:function(s) {
        console.log(`${this.getTime()} ${chalk.bgCyan(chalk.black(" CHATTO "))} ${s}`);
    },

    printWarn:function(s) {
        console.warn(`${this.getTime()} ${chalk.bgYellow(chalk.black(" WARNIN "))} ${chalk.yellow(s)}`);
    },
    
    printError:function(s) {
        console.error(`${this.getTime()} ${chalk.bgRed((" ERROR! "))} ${chalk.red(s)}`);
    },

    getTime:function() {
        const time = new Date();
        return chalk.green(`[${correctValue(time.getHours())}:${correctValue(time.getMinutes())}:${correctValue(time.getSeconds())}]`);
    }
}

function correctValue(i) {
    if (i <= 9) return "0"+i;
    else return i;
}