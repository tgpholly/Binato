console.clear();

import { ConsoleHelper } from "./ConsoleHelper";
import { readFileSync, existsSync } from "fs";
if (!existsSync("./config.json")) {
	ConsoleHelper.printError("You must have a config file in the root of Binato's folder structure.");
	ConsoleHelper.printError("Check the GitHub for an example file");
	process.exit(1);
}

import ChatHistory from "./server/ChatHistory";
import Config from "./server/interfaces/Config";
import HandleRequest from "./server/BanchoServer";
import { Registry, collectDefaultMetrics } from "prom-client";
import http from "http";
const config:Config = JSON.parse(readFileSync(__dirname + "/config.json").toString()) as Config;

if (config["prometheus"]["enabled"]) {
	const register:Registry = new Registry();
	register.setDefaultLabels({ app: "nodejs_binato" });

	collectDefaultMetrics({ register });

	const prometheusServer = http.createServer(async (req, res) => {
		if (req.method === "GET") {
			res.end(await register.metrics());
		}
	});

	prometheusServer.listen(config["prometheus"]["port"], () => ConsoleHelper.printInfo(`Prometheus metrics listening at port ${config["prometheus"]["port"]}`));
} else {
	ConsoleHelper.printWarn("Prometheus is disabled!");
}

const INDEX_PAGE:string = readFileSync("./web/serverPage.html").toString();

const binatoServer = http.createServer((req, res) => {
	let packet:Buffer = Buffer.alloc(0);
	req.on("data", (chunk:Buffer) => packet = Buffer.concat([packet, chunk], packet.length + chunk.length));
	req.on("end", () => {
		switch (req.method) {
			case "GET":
				if (req.url == "/" || req.url == "/index.html" || req.url == "/index") {
					res.end(INDEX_PAGE);
				} else if (req.url == "/chat") {
					// I don't think this works??
					res.end(ChatHistory.GenerateForWeb());
				}
				break;
			case "POST":
				HandleRequest(req, res, packet);
				break;
			default:
				res.writeHead(405);
				res.end("Method not allowed");
				break;
		}
	});
});

binatoServer.listen(config.http.port, () => ConsoleHelper.printInfo(`Binato is up! Listening at port ${config.http.port}`));