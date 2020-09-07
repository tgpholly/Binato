console.clear();

const app = require("express")(),
      fs  = require("fs"),
      busboy = require("connect-busboy"),
      osu = require("osu-packet");

const debugMode = true;

global.consoleHelper = require("./consoleHelper.js");

const serverHandler = require("./server/serverHandler.js");

app.use(busboy());

app.use((req, res) => {
    req.packet = new Buffer.alloc(0);
    req.on("data", (chunk) => req.packet = Buffer.concat([req.packet, chunk], req.packet.length + chunk.length));
    req.on("end", () => {
        switch (req.method) {
            case "GET":
                fs.readFile("serverPage.html", (err, data) => {
                    if (err) throw err;
                    
                    if (debugMode) data = data.toString().replace("|isdebug?|", '<b style="color:red;">DEBUG</b>');
                    else data = data.toString().replace("|isdebug?|", '');
                    res.send(data);
                });
            break;

            case "POST":
                // Make sure this address should respond to bancho requests
                // Bancho addresses: c, c1, c2, c3, c4, c5, c6, ce
                // Just looking for the first character being "c" *should* be enough
                if (req.headers["host"].split(".")[0][0] == "c")
                    serverHandler(req, res);
            break;

            default:
                res.status(405).send("405 | Method not allowed!<hr>Binato");
            break;
        }
    });
});

// TODO: Not have a predefined port,
//       doesn't matter for me so not top priority
app.listen(5001, () => global.consoleHelper.printBancho("Binato is up! Listening at port 5001"));