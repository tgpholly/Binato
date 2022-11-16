import { Application } from "express";
import compression from "compression";
import { ConsoleHelper } from "./ConsoleHelper";
import express from "express";
import { readFile } from "fs";
import { Registry, collectDefaultMetrics } from "prom-client";

const binatoApp:Application = express();
const config = require("./config.json");

if (config["prometheus"]["enabled"]) {
	const register:Registry = new Registry();
	register.setDefaultLabels({ app: "nodejs_binato" });

	collectDefaultMetrics({ register });

	const prometheusApp:Application = express();
	prometheusApp.get("/metrics", async (req, res) => {
		res.end(await register.metrics());
	});

	prometheusApp.listen(config["prometheus"]["port"], () => ConsoleHelper.printBancho(`Prometheus metrics listening at port ${config["prometheus"]["port"]}`));
} else {
	ConsoleHelper.printWarn("Prometheus is disabled!");
}

if (config["express"]["compression"]) {
	binatoApp.use(compression());
	ConsoleHelper.printBancho("Compression is enabled");
} else {
	ConsoleHelper.printWarn("Compression is disabled");	
}

binatoApp.use((req, res) => {
	let packet:Buffer = Buffer.alloc(0);
	req.on("data", (chunk:Buffer) => packet = Buffer.concat([packet, chunk], packet.length + chunk.length));
	req.on("end", () => {
		switch (req.method) {
			case "GET":
				if (req.url == "/" || req.url == "/index.html" || req.url == "/index") {
					res.sendFile(`${__dirname}/web/serverPage.html`);
				} else if (req.url == "/chat") {
					readFile("./web/chatPageTemplate.html", (err, data) => {
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