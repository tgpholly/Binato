const request = require("request"), RequestType = require("./RequestType.json");

const functionMap = {
    0: (resolve, body) => resolve(body),
    1: (resolve, body) => resolve(JSON.parse(body)),
    2: null
};

module.exports = async function(url, reqType = RequestType.Text) {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) reject(err);
            else functionMap[reqType](resolve, body);
        });
    });
}