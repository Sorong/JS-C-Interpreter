import Symbol from "./Symbol";

class VariableSymbol extends Symbol {

    constructor(name, type) {
        super(name);
        this.type = type;
    }
}

export default VariableSymbol;