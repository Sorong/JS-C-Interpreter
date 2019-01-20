import {Operator} from "./util/Operator";
import FunctionSymbol from "./Symbol/FunctionSymbol";
import MemorySpace from "./Memory/MemorySpace";

class Dispatcher {
    globalScope;
    sharedReturnValue;
    memorySpace;
    currentSpace;
    stack;

    constructor() {
        this.globalScope = null;
        this.globals = new MemorySpace("globals");
        this.currentSpace = this.globals;
        this.stack = [];

    }

    executeCode(start) {
        if(this.globalScope === null) {
            return "";
        }
        this.exec(this.globalScope.AST);
        let startSymbol = this.globalScope.resolve(start);
        if(startSymbol instanceof FunctionSymbol) {
            startSymbol = startSymbol.childScope[0]; //erster Scope der Funktion sollte der lokale scope sein
        }
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
            case "Constant":
                return ast.token;
            case "Minus":
            case "Plus":
                return this.operator(ast);
            case "Identifier":
                return this.resolveIdentifier(ast);
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
        let space = this.getSpaceWithSymbol();
        // if ( lhs.getType()==PieParser.DOT ) {    struct member
        //     fieldassign(lhs, value); // field ^('=' ^('.' a x) expr)
        //     return;
        // }
        if(space == null) { space = this.currentSpace}
        space.put(left.token, v);
    }

    operator(ast) {
        let left = this.exec(ast.children[0]);
        let right = this.exec(ast.children[1]);
        if(left === undefined || right === undefined) {
            return "AdditionError";
        }

        return eval(left + ast.token + right);
    }


    getSpaceWithSymbol(name) {
        if(this.stack.length > 0 && this.stack[0].get(name) !== null) {
            return this.stack[0];
        }
        if(this.globals.get(name) !== null) {return this.globals;}
        return null;
    }
}

export default Dispatcher;