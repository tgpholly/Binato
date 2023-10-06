import { readFileSync, writeFileSync } from "fs";
import { minify } from "terser";

const DISABLE = false;
writeFileSync("./build/.MANGLED", `${DISABLE}`);

if (DISABLE) {
	writeFileSync("./build/Binato.js", readFileSync("./build/combined.js"));
	console.warn("[WARNING] mangle.ts is disabled!");
} else {
	(async () => {
		const mangled = await minify(readFileSync("./build/combined.js").toString(), {
			mangle: true,
			toplevel: true,
		});
		writeFileSync("./build/Binato.min.js", `${mangled.code}`);
	})();
}