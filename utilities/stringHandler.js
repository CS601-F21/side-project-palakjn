class StringBuffer {
    constructor() {
        this.buffer = [];
        this.index = 0;
    }

    /**
     * Append the specified string to the end of the buffer
     * @param {*} s 
     * @returns 
     */
    append(s) {
        this.buffer[this.index] = s;
        this.index += 1;
        return this;
    }

    /**
     * Join the strings in the buffer
     * @returns 
     */
    toString() {
        return this.buffer.join("");
    }
}


module.exports = StringBuffer;