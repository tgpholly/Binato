// fileSmasher ~.~
// for when you're just too lazy to
// do it properly.

import { readdirSync, lstatSync, readFileSync, writeFileSync } from "fs";

let tsFileData:Array<string> = new Array<string>();
const tsEvenFirsterData:Array<string> = new Array<string>();
const tsVeryFirstData:Array<string> = new Array<string>();
const tsFirstFileData:Array<string> = new Array<string>();
const tsLastFileData:Array<string> = new Array<string>();
const tsEverythingElse:Array<string> = new Array<string>();

function readDir(nam:string) {
	const files = readdirSync(nam);
	for (const file of files) {
		if (nam == "./" && (file.startsWith(".") || file == "tooling" || file == "build" || file == "node_modules" || file == "combined.ts")) {
			continue;
		}

		// This is a very dumb way of checking for folders
		// protip: don't do this.
		if (lstatSync(`${nam}/${file}`).isDirectory()) {
			readDir(`${nam}/${file}`);
		} else if (file.endsWith(".ts")) {
			if (file == "Binato.ts") {
				tsLastFileData.push(readFileSync((`${nam}/${file}`).replace("//", "/")).toString());
			} else if (nam.includes("commands") || file.includes("ConsoleHelper")) {
				tsEvenFirsterData.push(readFileSync((`${nam}/${file}`).replace("//", "/")).toString());
			} else if (file.includes("FunkyArray") || file.includes("ChatManager") || file.includes("MultiplayerManager") || file === "Bot.ts") {
				tsVeryFirstData.push(readFileSync((`${nam}/${file}`).replace("//", "/")).toString());
			} else if (nam.includes("enum") || nam.includes("packets") || (nam.includes("objects") && !file.includes("FunkyArray") ) || file.includes("SpectatorManager")) {
				tsFirstFileData.push(readFileSync((`${nam}/${file}`).replace("//", "/")).toString());
			} else {
				tsEverythingElse.push(readFileSync((`${nam}/${file}`).replace("//", "/")).toString());
			}
		}
	}
}

readDir("./");

tsFileData = tsFileData.concat(tsEvenFirsterData).concat(tsVeryFirstData).concat(tsFirstFileData).concat(tsEverythingElse).concat(tsLastFileData);

const combinedFiles = tsFileData.join("\n");

const splitLines = combinedFiles.split("\n");
const resultLines:Array<string> = new Array<string>();

// Insert allowed imports
resultLines.push(`import { IncomingMessage, ServerResponse } from "http";
import { Registry, collectDefaultMetrics } from "prom-client";
import { RedisClientType, createClient } from "redis";
import { readFileSync, existsSync } from "fs";
import { randomBytes, pbkdf2 } from "crypto";
import { createPool, Pool } from "mysql2";
import * as dyetty from "dyetty";
import fetch from "node-fetch";
import http from "http";`);

// Let's process the file to make it usable
for (const line of splitLines) {
	// Throw away imports as they aren't needed
	// TODO: Add allow list for npm module imports
	if (line.startsWith("import")) {
		continue;
	}
	// Fix up classes, interfaces and such.
	//resultLines.push(line);
	resultLines.push(line.replace("export default", "").replace("export class", "class").replace("export interface", "interface").replace("export enum", "enum").replace("export type", "type"));
}

writeFileSync("./combined.ts", resultLines.join("\n"));
