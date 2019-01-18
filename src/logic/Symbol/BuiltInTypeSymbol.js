import Symbol from "./Symbol";
import Type from "./Type";

class BuiltInTypeSymbol extends Symbol{
    constructor(t) {
        super(t)
    }
}
Object.assign(BuiltInTypeSymbol.prototype, Type);
export default BuiltInTypeSymbol;