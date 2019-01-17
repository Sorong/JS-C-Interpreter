import Symbol from "./Symbol";
import Type from "./Type";

class BuiltInTypeSymbol extends Type(Symbol) {
    constructor(type) {
        super(type)
    }
}

export default BuiltInTypeSymbol;