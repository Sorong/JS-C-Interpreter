import Symbol from "./Symbol";
import Scope from "../Scope/Scope";

class ScopedSymbol extends Symbol {
    enclosingScope; // null if global (outermost) scope
    symbols = {};
    constructor(name, type, enclosingScope) {
        super(name);
        this.type = type;
        this.enclosingScope = enclosingScope;
    }

    bind(sym) { //define?
        this.symbols[sym.name] = sym
    }

    resolve(name) {
        let symbol = this.symbols[name];
        if(symbol != null) {return symbol;}
        if(this.enclosingScope != null) {
            return this.enclosingScope.resolve(name);
        }
        return null;
    }

}
export default ScopedSymbol;