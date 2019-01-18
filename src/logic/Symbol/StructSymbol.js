import Symbol from "./Symbol";
import Type from "./Type";


class StructSymbol extends Type(Symbol) {
    constructor(type) {
        super(type)
    }
}

export default StructSymbol;