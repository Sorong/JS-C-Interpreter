import MemorySpace from "./MemorySpace";

class StructInstance extends MemorySpace{
    scope;
    constructor(scope) {
        super(scope.name);
        this.scope = scope;
    }

    get(name) {
        let ret = super.get(name);
        if(ret != null) {
            return ret;
        }
        let sym = this.scope.resolveMember(name);
        if(sym != null) {
            super.put(sym, null);
        }
        return super.get(name);
    }
}

export default StructInstance;