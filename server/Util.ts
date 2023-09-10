import { randomBytes } from "crypto";

export function generateSession() : Promise<string> {
	return new Promise<string>((resolve, reject) => {
		randomBytes(12, (err, buf) => {
			if (err) {
				return reject(err);
			}

			resolve(buf.toString("hex"));
		});
	});
}

export function hexlify(data:Buffer) : string {
	let out:string = "";
	for (let i = 0; i < data.length; i++) {
		const hex = data[i].toString(16);
		if (hex.length === 1) {
			out += `0${hex.toUpperCase()},`;
		} else {
			out += `${hex.toUpperCase()},`;
		}
	}

	return out.slice(0, out.length - 1);
}

export function isNullOrEmpty(str:string | undefined | null) {
	if (typeof(str) === "string") {
		return str !== "";
	}

	return false;
}