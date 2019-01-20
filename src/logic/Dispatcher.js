import {Operator} from "./util/Operator";
import FunctionSymbol from "./Symbol/FunctionSymbol";
import MemorySpace from "./Memory/MemorySpace";
import StructSymbol from "./Symbol/StructSymbol";
import StructInstance from "./Memory/StructInstance";
import FunctionSpace from "./Memory/FunctionSpace";

class Dispatcher {
    globalScope;
    sharedReturnValue;
    globals;
    currentSpace;
    stack;

    constructor() {
        this.globalScope = null;
        this.globals = new MemorySpace("globals");
        this.currentSpace = this.globals;
        this.stack = [];
        this.skipFunction = true;
    }

    executeCode(start) {
        if(this.globalScope === null) {
            return "";
        }
        this.skipFunction = true;
        this.exec(this.globalScope.AST);
        this.skipFunction = false;
        let startSymbol = this.globalScope.resolve(start);
        // if(startSymbol instanceof FunctionSymbol) {
        //     this.stack.push(new MemorySpace(startSymbol));
        //     this.currentSpace = this.stack[0];
        //     startSymbol = startSymbol.childScope[0]; //erster Scope der Funktion sollte der lokale scope sein
        //
        // }
        if(startSymbol == null) {
            return start + " nicht gefunden";
        }
        return this.exec(startSymbol.AST);
    }

    exec(ast) {
        let tokentype = ast.tokentype;
        switch(tokentype) {
            case "Block":
                this.block(ast);
                break;
            case "Return":
                this.returnStatement(ast);
                break;
            case "Assign":
                this.assign(ast);
                break;
            case "Dot":
            case "Constant":
                return this.load(ast);
            case "Compare":
            case "Plus":
                return this.operator(ast);
            case "Identifier":
                return this.resolveIdentifier(ast);
            case "Struct":
                return this.instance(ast);
            case "Declaration":
                this.declaration(ast);
                break;
            case "If":
                this.ifstat(ast);
                break;
            case "Function":
                return this.call(ast);
            case "While":
                this.whileloop(ast);
                break;
            default:
                throw "Unknown Tokentype " + tokentype;
        }
        return 0;
    }

    resolveIdentifier(ast) {
        let space = this.getSpaceWithSymbol(ast.token);
        if(space != null) {
            return space.get(ast.token);
        }

    }


    block(ast) {
        for(let i = 0; i < ast.children.length; i++) {
            this.exec(ast.children[i]);
        }
    }

    returnStatement(ast) {
        if(ast.children.length !== 0) {
            this.sharedReturnValue = this.exec(ast.children[0]);
        } else {
            this.sharedReturnValue = 0;   //return aktuell nicht im AST
        }

        throw this.sharedReturnValue;
    }

    assign(ast) {

        let left = ast.children[0];
        let right = ast.children[1];
        let v = this.exec(right);
        if(left.tokentype == "Dot") {
            this.fieldAssign(left, v);
            return;
        }
        // if ( lhs.getType()==PieParser.DOT ) {    struct member
        //     fieldassign(lhs, value); // field ^('=' ^('.' a x) expr)
        //     return;
        // }
        let space = this.getSpaceWithSymbol(left.token);
        if(space == null) { space = this.currentSpace}
        space.put(left.token, v);
    }

    fieldAssign(ast, val) {
        let name = ast.children[0];
        let member = ast.children[1];
        let o = this.load(name);
        let m = o.scope.resolveMember(member.token);
        if(o instanceof StructInstance && m != null && m.name == member.token) {
            o.put(member.token, val);
        } else {
            throw "Ungültiges Feld " + member + " in " + name
        }
    }
    declaration(ast) {
        for(let i = 0; i < ast.children.length; i++) {
            let space = this.getSpaceWithSymbol(ast.children[i].token);
            if(space != null) {
                throw "Mehrfachdeklaration von " + ast.children[i].token;
            }
            let declType = ast.scope.resolve(ast.children[i].token);
            let instance = ast.scope.resolve(declType.type);
            if(instance instanceof StructSymbol) {
                this.currentSpace.put(ast.children[i].token, new StructInstance(instance));
            } else {
                this.currentSpace.put(ast.children[i].token, null);
            }

        }
    }

    operator(ast) {
        let left = this.exec(ast.children[0]);
        let right = this.exec(ast.children[1]);
        if(left === undefined || right === undefined) {
            return "AdditionError";
        }

        return eval(left + ast.token + right);
    }

    load(ast) {
        if(ast.tokentype === "Constant") {
            return ast.token;
        }
        if(ast.tokentype === "Dot") {
            return this.fieldLoad(ast);
        }
        let memSpace = this.getSpaceWithSymbol(ast.token);
        if(memSpace != null) {
            return memSpace.get(ast.token);
        }
        return null;
    }

    fieldLoad(ast) {
        let expr = ast.children[0];
        let b = ast.children[1];
        let struct = this.load(expr);
        if(struct == null || (!(struct.scope instanceof StructSymbol) && struct.scope.resolveMember(b.token) == null)) {
            //Todo: Errorhandling
            return null;
        }
        return struct.get(b.token)
    }


    getSpaceWithSymbol(name) {
        if(this.stack.length > 0 && this.stack[this.stack.length-1].get(name) !== null) {
            return this.stack[this.stack.length-1];
        }
        if(this.globals.get(name) !== null) {return this.globals;}
        return null;
    }

    instance(ast) {
        let structAST = ast.children[0];
        let structInstance = ast.scope.resolve(structAST.token);
        if(structInstance != null)  {
            structInstance = new StructInstance(structInstance);
        }
        return structInstance;
    }

    ifstat(ast) {
        let cond = this.exec(ast.children[0]);
        if(cond === true && ast.children.length > 1) {
            this.exec(ast.children[1]);
        } else if(cond === false && ast.children.length > 2) {
            this.exec(ast.children[2]);
        } else if(cond !== false && cond !== true) {
            throw "Ungültiger Vergleich"
        }
    }

    call(ast) {
        if(this.skipFunction) { //damit beim initialisieren des Globalscope nicht jede Funktion ausgeführt wird die gefunden wird.
            return null;
        }
        let fnSymbol = ast.scope.resolve(ast.token);
        if(fnSymbol == null) {
            throw "Funktion nicht gefunden";
        }
        let fspace = new FunctionSpace(fnSymbol);
        let saveSpace = this.currentSpace;
        this.currentSpace = fspace;

        let argcount = ast.children.length;
        if(ast.children.length > 0 && ast.children[0].token == "Block") {
            argcount -= 1;
        }
        let fArgs = fspace.formalArgs();
        if( (fArgs == null && argcount > 0) || fArgs != null && fArgs.length !== argcount) {
            throw "Ungültiger Funktionsaufruf für " + ast.token;
        }
        if(fArgs != null) {
            for(let i = 0; i < fArgs.length; i++) {
                let param = ast.children[i];
                let arg = this.exec(param);
                fspace.put(fArgs[i].name, arg);
            }
        }
        this.stack.push(fspace);
        let result = null;
        try {
            if(fnSymbol.AST.children[0].token === "Block") {
                this.exec(fnSymbol.AST.children[0]);
            } else {
                this.exec(fnSymbol.childScope[0].AST);
            }

        } catch (e) {
            result = e;
            console.log(e);
            this.stack.pop();
            this.currentSpace = saveSpace;
        }
        return result;
    }
    whileloop(ast) {
        let cond = this.exec(ast.children[0]);
        while(cond) {
            this.exec(ast.children[1]);
            cond = this.exec(ast.children[0]);
        }
    }
}

export default Dispatcher;