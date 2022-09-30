const fetch = require("node-fetch");

const functionMap = {
	"text": async (res) => await res.text(),
	"json": async (res) => await res.json()
};

module.exports = async function(url, reqType = "text") {
	return new Promise(async (resolve, reject) => {
		try {
			resolve(functionMap[reqType](await fetch(url)));
		} catch (e) {
			reject(e);
		}
	});
}