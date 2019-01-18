import Symbol from "./Symbol";
import Scope from "../Scope/Scope";

class ScopedSymbol extends Symbol {
    enclosingScope; // null if global (outermost) scope
    symbols = {};
    childScope = {};
    childScopeIndex = 0;
    constructor(name, type, enclosingScope) {
        super(name);
        this.type = type;
        this.enclosingScope = enclosingScope;
        if(enclosingScope != null && enclosingScope !== undefined) {
            enclosingScope.childScope[this.childScopeIndex] = this;
            enclosingScope.childScopeIndex++;
        }
    }

    bind(sym) { //define?
        this.symbols[sym.name] = sym;
        sym.scope = this;
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