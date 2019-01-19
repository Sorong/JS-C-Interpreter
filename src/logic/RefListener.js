import {CListener} from "../grammar/CListener";

class RefListener extends CListener {
    globals;
    scopes;
    constructor(globals, scopes) {
        super();
        this.globals = globals;
        this.scopes = scopes;
    }

    setScopes(globals, scopes) {
        this.globals = globals;
        this.scopes = scopes;
    }
}

export default RefListener;