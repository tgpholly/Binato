console.clear();

import { ConsoleHelper } from "./ConsoleHelper";
import { readFileSync, existsSync } from "fs";
if (!existsSync("./config.json")) {
	ConsoleHelper.printError("You must have a config file in the root of Binato's folder structure.");
	ConsoleHelper.printError("Check the GitHub for an example file");
	process.exit(1);
}

import { ChatHistory } from "./server/ChatHistory";
import compression from "compression";
import express from "express";
import { HandleRequest, GetSharedContent, SharedContent } from "./server/BanchoServer";
import { Registry, collectDefaultMetrics } from "prom-client";
const config:any = JSON.parse(readFileSync(__dirname + "/config.json").toString());
// Pull out shared data from BanchoServer
const sharedContent:SharedContent = GetSharedContent();

const binatoApp:express.Application = express();

if (config["prometheus"]["enabled"]) {
	const register:Registry = new Registry();
	register.setDefaultLabels({ app: "nodejs_binato" });

	collectDefaultMetrics({ register });

	const prometheusApp:express.Application = express();
	prometheusApp.get("/metrics", async (req, res) => {
		res.end(await register.metrics());
	});

	prometheusApp.listen(config["prometheus"]["port"], () => ConsoleHelper.printInfo(`Prometheus metrics listening at port ${config["prometheus"]["port"]}`));
} else {
	ConsoleHelper.printWarn("Prometheus is disabled!");
}

if (config["express"]["compression"]) {
	binatoApp.use(compression());
	ConsoleHelper.printInfo("Compression is enabled");
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
				HandleRequest(req, res, packet);
			break;

			default:
				res.status(405).send("405 | Method not allowed!<hr>Binato");
			break;
		}
	});
});

binatoApp.listen(config.express.port, () => ConsoleHelper.printInfo(`Binato is up! Listening at port ${config.express.port}`));