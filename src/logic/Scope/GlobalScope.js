import Scope from "./Scope";
import BuiltInTypeSymbol from "../Symbol/BuiltInTypeSymbol";

class GlobalScope extends Scope {


    constructor(){
        super(null);

        this.initTypeSystem()
    }

    initTypeSystem() {
        this.bind(new BuiltInTypeSymbol("char"));
        //signed + unsinged
        this.bind(new BuiltInTypeSymbol("int"));
        //unsigned
        this.bind(new BuiltInTypeSymbol("short"));
        //unsigned
        this.bind(new BuiltInTypeSymbol("long"));
        //unsigned
        this.bind(new BuiltInTypeSymbol("float"));
        this.bind(new BuiltInTypeSymbol("double"));
    }

    bind(sym) {
        return super.bind(sym);
    }

}

export default GlobalScope;