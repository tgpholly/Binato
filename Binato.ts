import { ChatHistory } from "./server/ChatHistory";
import compression from "compression";
import config from "./config.json";
import { ConsoleHelper } from "./ConsoleHelper";
import express from "express";
import { HandleRequest } from "./server/BanchoServer";
import { readFileSync } from "fs";
import { Registry, collectDefaultMetrics } from "prom-client";

const binatoApp:express.Application = express();

if (config["prometheus"]["enabled"]) {
	const register:Registry = new Registry();
	register.setDefaultLabels({ app: "nodejs_binato" });

	collectDefaultMetrics({ register });

	const prometheusApp:express.Application = express();
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

const INDEX_PAGE:string = readFileSync("./web/serverPage.html").toString();

binatoApp.use((req, res) => {
	let packet:Buffer = Buffer.alloc(0);
	req.on("data", (chunk:Buffer) => packet = Buffer.concat([packet, chunk], packet.length + chunk.length));
	req.on("end", () => {
		switch (req.method) {
			case "GET":
				if (req.url == "/" || req.url == "/index.html" || req.url == "/index") {
					res.send(INDEX_PAGE);
				} else if (req.url == "/chat") {
					res.send(ChatHistory.GenerateForWeb());
				}
			break;

			case "POST":
				// Make sure this address should respond to bancho requests
				// Bancho addresses: c, c1, c2, c3, c4, c5, c6, ce
				// Just looking for the first character being "c" *should* be enough
				if (req.headers.host != null && req.headers.host.split(".")[0][0] == "c")
					HandleRequest(req, res, packet);
				else
					res.status(400).send("400 | Bad Request!<br>Binato only accepts POST requests on Bancho subdomains.<hr>Binato");
			break;

			default:
				res.status(405).send("405 | Method not allowed!<hr>Binato");
			break;
		}
	});
});