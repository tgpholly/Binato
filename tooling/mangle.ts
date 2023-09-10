import { readFileSync, writeFileSync } from "fs";
import { minify } from "terser";

(async () => {
	const mangled = await minify(readFileSync("./build/combined.js").toString(), {
		mangle: true,
		toplevel: true,
	});
	writeFileSync("./build/index.min.js", `${mangled.code}`);
})();