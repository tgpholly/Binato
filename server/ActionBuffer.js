module.exports = class {
    constructor(initialData = Buffer) {
        this.actionBuffer;
        if (initialData.length == 0) {
            this.actionBuffer = Buffer.alloc(0);
        } else {
            this.actionBuffer = initialData;
        }
    }

    bufferAction(data = Buffer) {
        if (data.length != 0)
            this.actionBuffer = Buffer.concat([this.actionBuffer, data], this.actionBuffer.length + data.length);
    }

    toBuffer() {
        return this.actionBuffer;
    }
}