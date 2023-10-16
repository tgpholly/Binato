import { readFileSync, writeFileSync } from "fs";
import { minify } from "terser";

const DISABLE = false;
writeFileSync("./build/.MANGLED", `${DISABLE}`);

if (DISABLE) {
	writeFileSync("./build/Binato.js", readFileSync("./build/index.js"));
	console.warn("[WARNING] mangle.ts is disabled!");
} else {
	(async () => {
		const mangled = await minify(readFileSync("./build/index.js").toString(), {
			mangle: true,
			toplevel: true,
		});
		writeFileSync("./build/Binato.min.js", `${mangled.code}`);
	})();
}