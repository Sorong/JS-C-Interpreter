import Symbol from "./Symbol";

class VariableSymbol extends Symbol {
    arrayLength;
    constructor(name, type) {
        super(name);
        this.type = type;
        this.arrayLength = null;
        if(this.name[this.name.length - 1] === "]") {
            let splitted = name.split("[");
            this.name = splitted[0];
            this.arrayLength = splitted[1].substr(0, splitted[1].length - 1);
        }

    }
    isArray() {
        return this.arrayLength !== null;
    }
}

export default VariableSymbol;