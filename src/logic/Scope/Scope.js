class Scope {
    name;
    enclosingScope; // null if global (outermost) scope
    symbols = {};
    constructor(enclosingScope) {
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
};

export default Scope;