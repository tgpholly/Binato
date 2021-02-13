const request = require("request");

module.exports = async function(url) {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) reject(err);
            else resolve(body);
        });
    });
}