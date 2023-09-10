import { readdirSync, rmSync, renameSync } from "fs";

const libFiles = readdirSync("./build");

for (const file of libFiles) {
	if (!file.startsWith("index.min.js")) {
		rmSync(`./build/${file}`, { recursive: true });
	}
}

//renameSync("./build/combined.js", "./build/index.js");
//renameSync("./build/combined.d.ts", "./build/index.d.ts");