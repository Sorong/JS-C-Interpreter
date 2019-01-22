class Exception {
    msg;
    constructor(msg) {
        this.msg = msg;
    }

    toString() {
        return this.msg;
    }
}

export default Exception;