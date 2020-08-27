const chalk = require("chalk");

module.exports = {
    printWebReq:function(s) {
        console.log(`${chalk.green("["+this.getTime()+"]")} ${chalk.bgGreen((" WEBREQ "))} ${s}`);
    },
    
    printBancho:function(s) {
        console.log(`${chalk.green("["+this.getTime()+"]")} ${chalk.bgMagenta((" BANCHO "))} ${s}`);
    },

    printChat:function(s) {
        console.log(`${chalk.green("["+this.getTime()+"]")} ${chalk.bgCyan((" CHAT "))} ${s}`);
    },

    printWarn:function(s) {
        console.warn(`${chalk.green("["+this.getTime()+"]")} ${chalk.bgYellow((" WARN "))} ${chalk.yellow(s)}`);
    },
    
    printError:function(s) {
        console.error(`${chalk.green("["+this.getTime()+"]")} ${chalk.bgRed((" ERROR "))} ${chalk.red(s)}`);
    },

    getTime:function() {
        const time = new Date();
        return `${correctValue(time.getHours())}:${correctValue(time.getMinutes())}:${correctValue(time.getSeconds())}`;
    }
}

function correctValue(i) {
    if (i <= 9) return "0"+i;
    else return i;
}