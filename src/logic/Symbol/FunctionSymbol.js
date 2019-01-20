import ScopedSymbol from "./ScopedSymbol";

class FunctionSymbol extends ScopedSymbol {

    formalArgs() {
        if(this.symbolList.length === 0) {
            return null;
        }
        return this.symbolList;
    }
}

export default FunctionSymbol