import MemorySpace from "./MemorySpace";

class FunctionSpace extends MemorySpace {
    scope;
    args = [];
    constructor(scope) {
        super(scope.name);
        this.scope = scope;
        let args = this.scope.formalArgs();
        if(args !== undefined && args !== null) {
            for(let i = 0; i < args.length; i++) {
                this.put(args[i].name, null);
                this.args.push(args[i]);
            }
        }
    }

    formalArgs() {
        if(this.args.length === 0) {
            return null;
        }
        return this.args;
    }
}

export default FunctionSpace;