class Scope {
    name;
    enclosingScope; // null if global (outermost) scope
    symbols = {};
    childScope = []; //Für debuggingzwecke
    childScopeIndex = 0;
    constructor(enclosingScope) {
        this.enclosingScope = enclosingScope;
        if(enclosingScope != null && enclosingScope !== undefined) {
            enclosingScope.childScope[enclosingScope.childScopeIndex] = this;
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
};

export default Scope;