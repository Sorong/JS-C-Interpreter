import ScopedSymbol from "./ScopedSymbol";


class StructSymbol extends ScopedSymbol {

    resolveMember(name) {
        let symbol = this.symbols[name];
        if (symbol != null) {
            return symbol;
        }
        return null;
    }
}

export default StructSymbol;