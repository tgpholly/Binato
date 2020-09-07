const tcpx = require('tcp-netx'),
      aes256 = require('aes256');

module.exports = class {
    constructor(databaseAddress, databasePort, databaseKey) {
        this.databaseKey = databaseKey;

        // Create a new instance of tcp-netx and connect to the database
        this.databaseServer = new tcpx.server(databaseAddress, databasePort);
        this.databaseServer.connect();


        // First response will always be broken
        this.databaseServer.write({data: aes256.encrypt(this.databaseKey, `p|`)});
        this.databaseServer.read();
    }

    executeInDB(query) {
        const result = this.databaseServer.write({data: aes256.encrypt(this.databaseKey, `r|${query}`)});

        if (result.ok == 1) return this.databaseServer.read();
        else throw "Database error"
    }

    getFromDB(query) {
        const result = this.databaseServer.write({data: aes256.encrypt(this.databaseKey, `g|${query}`)});

        if (result.ok == 1) return JSON.parse(aes256.decrypt(this.databaseKey, this.databaseServer.read()["data"]));
        else throw "Database error";
    }
}