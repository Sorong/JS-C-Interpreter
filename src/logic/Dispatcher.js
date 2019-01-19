class Dispatcher {
    globalScope;
    constructor() {
        this.globalScope = null;
    }

    executeCode(start) {
        if(this.globalScope === null) {
            return "";
        }
    }

}

export default Dispatcher;