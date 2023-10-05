import { readdirSync, rmSync, readFileSync } from "fs";

const libFiles = readdirSync("./build");

const mangled = readFileSync("./build/.MANGLED").toString() === "false";

for (const file of libFiles) {
	if (!file.startsWith(mangled ? "Binato.min.js" : "Binato.js")) {
		rmSync(`./build/${file}`, { recursive: true });
	}
}