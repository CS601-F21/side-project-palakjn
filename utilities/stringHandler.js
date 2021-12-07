class StringBuffer {
    constructor() {
        this.buffer = [];
        this.index = 0;
    }

    append(s) {
        this.buffer[this.index] = s;
        this.index += 1;
        return this;
    }

    toString() {
        return this.buffer.join("");
    }
}


module.exports = StringBuffer;