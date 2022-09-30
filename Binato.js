console.clear();

// Globals
global.protocolVersion = 19;

const app = require("express")(),
	  consoleHelper = require("./consoleHelper.js"),
	  prometheusApp = require("express")(),
	  fs  = require("fs"),
	  serverHandler = require("./server/serverHandler.js"),
	  config = require("./config.json");

if (config.prometheus.enabled) {
	// We only need to require this if prom metrics are on.
	const prom = require("prom-client");

	const register = new prom.Registry();

	register.setDefaultLabels({ app: "nodejs_binato" });
	
	prom.collectDefaultMetrics({ register });
	
	prometheusApp.get("*", async (req, res) => {
		if (req.url.split("?")[0] != "/metrics") return res.status(404).end("");
	
		res.end(await register.metrics());
	});
	
	prometheusApp.listen(config.prometheus.port, () => consoleHelper.printBancho(`Prometheus metrics listening at port ${config.prometheus.port}`));
} else consoleHelper.printWarn("Prometheus is disabled!");

if (config.express.compression) {
	app.use(require("compression")());
	consoleHelper.printBancho("Compression is enabled.");
} else consoleHelper.printWarn("Compression is disabled!");

app.use((req, res) => {
	req.packet = Buffer.alloc(0);
	req.on("data", (chunk) => req.packet = Buffer.concat([req.packet, chunk], req.packet.length + chunk.length));
	req.on("end", () => {
		switch (req.method) {
			case "GET":
				if (req.url == "/" || req.url == "/index.html" || req.url == "/index") {
					res.sendFile(`${__dirname}/web/serverPage.html`);
				} else if (req.url == "/chat") {
					fs.readFile("./web/chatPageTemplate.html", (err, data) => {
						if (err) throw err;

						let lines = "", flip = false;
						const limit = global.chatHistory.length < 10 ? 10 : global.chatHistory.length;
						for (let i = global.chatHistory.length - 10; i < limit; i++) {
							if (i < 0) i = 0;
							lines += `<div class="line line${flip ? 1 : 0}">${global.chatHistory[i] == null ? "<hidden>blank</hidden>" : global.chatHistory[i]}</div>`
							flip = !flip;
						}
						
						res.send(data.toString().replace("|content|", lines));
					});
				}
			break;

			case "POST":
				// Make sure this address should respond to bancho requests
				// Bancho addresses: c, c1, c2, c3, c4, c5, c6, ce
				// Just looking for the first character being "c" *should* be enough
				if (req.headers["host"].split(".")[0][0] == "c")
					serverHandler(req, res);
				else
					res.status(400).send("400 | Bad Request!<br>Binato only accepts POST requests on Bancho subdomains.<hr>Binato");
			break;

			default:
				res.status(405).send("405 | Method not allowed!<hr>Binato");
			break;
		}
	});
});

app.listen(config.express.port, () => consoleHelper.printBancho(`Binato is up! Listening at port ${config.express.port}`));