import Config from "./server/objects/Config";
import ConsoleHelper from "./ConsoleHelper";
import ChatHistory from "./server/managers/ChatHistory";
import HandleRequest from "./server/BanchoServer";
import http from "http";
import { Registry, collectDefaultMetrics } from "prom-client";
import { readFileSync } from "fs";

if (Config.prometheus.enabled) {
	const register:Registry = new Registry();
	register.setDefaultLabels({ app: "nodejs_binato" });

	collectDefaultMetrics({ register });

	const prometheusServer = http.createServer(async (req, res) => {
		if (req.method === "GET") {
			res.end(await register.metrics());
		}
	});

	prometheusServer.listen(Config.prometheus.port, () => ConsoleHelper.printInfo(`Prometheus metrics listening at port ${Config.prometheus.port}`));
} else {
	ConsoleHelper.printWarn("Prometheus is disabled!");
}

const INDEX_PAGE:string = readFileSync("./web/serverPage.html").toString();

const binatoServer = http.createServer((req, res) => {
	let packet:Buffer = Buffer.alloc(0);
	req.on("data", (chunk:Buffer) => packet = Buffer.concat([packet, chunk], packet.length + chunk.length));
	req.on("end", async () => {
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
				await HandleRequest(req, res, packet);
				break;
			default:
				res.writeHead(405);
				res.end("Method not allowed");
				break;
		}
	});
});

binatoServer.listen(Config.http.port, () => ConsoleHelper.printInfo(`Binato is up! Listening at port ${Config.http.port}`));