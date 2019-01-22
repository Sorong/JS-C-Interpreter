import {Operator} from "../Util/Operator";
import FunctionSymbol from "../Symbol/FunctionSymbol";
import MemorySpace from "../Memory/MemorySpace";
import StructSymbol from "../Symbol/StructSymbol";
import StructInstance from "../Memory/StructInstance";
import FunctionSpace from "../Memory/FunctionSpace";
import ReturnValue from "./ReturnValue";
import Exception from "../Util/Exception";

class Dispatcher {
    globalScope;
    sharedReturnValue;
    globals;
    currentSpace;
    stack;
    outStr;

    constructor() {
        this.globalScope = null;
        this.globals = new MemorySpace("globals");
        this.currentSpace = this.globals;
        this.stack = [];
        this.skipFunction = true;
        this.outStr = "";
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
        let ret = this.exec(startSymbol.AST);
        return ret;
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
            case "Array":
                return this.loadArray(ast);
            case "Compare":
            case "Plus":
            case "Star":
                return this.operator(ast);
            case "Identifier":
                return this.resolveIdentifier(ast);
            case "Struct":
                return this.instance(ast);
            case "DeclarationArray":
                this.declarationArray(ast);
                break;
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
            case "Print":
                this.print(ast);
                break;
            case "For":
                this.forLoop(ast);
                break;
            case "MinusMinus":
            case "PlusPlus":
                this.operatorConcat(ast);
                break;
            default:
                throw new Exception("Unknown Tokentype " + tokentype);
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
            if(ast.children[0].tokentype === "Array") {
                let space = this.getSpaceWithSymbol(ast.children[0].token);
                if(space != null) {
                    let index = parseInt(ast.children[0].children[0].token);
                    this.sharedReturnValue = space.members[ast.children[0]][index];
                } else {
                    this.sharedReturnValue = null;
                }
            } else {
                this.sharedReturnValue = this.exec(ast.children[0]);
            }
        } else {
            this.sharedReturnValue = 0;   //return aktuell nicht im AST
        }

        throw new ReturnValue(this.sharedReturnValue);
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
        if(space == null) { space = this.currentSpace; }
        if(left.tokentype == "Array") {
            let index = parseInt(left.children[0].token);
            space.members[left.token][index] = v;
        } else {
            space.put(left.token, v);
        }

    }

    fieldAssign(ast, val) {
        let name = ast.children[0];
        let member = ast.children[1];
        let o = this.load(name);
        let m = o.scope.resolveMember(member.token);
        if(o instanceof StructInstance && m != null && m.name === member.token) {
            o.put(member.token, val);
        } else {
            throw new Exception("Ungültiges Feld " + member + " in " + name);
        }
    }

    declaration(ast) {
        for(let i = 0; i < ast.children.length; i++) {
            let space = this.getSpaceWithSymbol(ast.children[i].token);
            if(space != null) {
                throw new Exception("Mehrfachdeklaration von " + ast.children[i].token);
            }
            let declType = ast.scope.resolve(ast.children[i].token);
            if(declType == null) {
                throw new Exception("Variable kann nich deklariert werden");
            }
            let instance = ast.scope.resolve(declType.type);
            if(instance instanceof StructSymbol) {
                this.currentSpace.put(ast.children[i].token, new StructInstance(instance));
            } else {
                this.currentSpace.put(ast.children[i].token, null);
            }

        }
    }
    declarationArray(ast) {
        let declType = ast.scope.resolve(ast.token);
        if(declType == null) {
            throw new Exception("Variable kann nich deklariert werden");
        }
        let arr = new Array(declType.arrayLength);
        this.currentSpace.put(ast.token, arr);
    }

    operator(ast) {
        let left;
        if(ast.children[0].tokentype === "Array") {
            left = this.loadArrayContent(ast.children[0])
        } else {
            left = this.exec(ast.children[0]);
        }
        let right;
        if(ast.children[1].tokentype === "Array") {
            right = this.loadArrayContent(ast.children[1])
        } else {
            right = this.exec(ast.children[1]);
        }
        if(left === undefined || right === undefined) {
            throw new Exception("AdditionError");
        }

        return eval(left + ast.token + right);
    }

    operatorConcat(ast) {
        let operator = ast.token;
        let operand = ast.children[0];
        let v = ast.tokentype === "PlusPlus" ? 1 : -1;
        if(operand.tokentype == "Dot") {
            this.fieldAssign(operand, this.load(operand) + v);
            return;
        }

        // if ( lhs.getType()==PieParser.DOT ) {    struct member
        //     fieldassign(lhs, value); // field ^('=' ^('.' a x) expr)
        //     return;
        // }
        let space = this.getSpaceWithSymbol(operand.token);
        if(space == null) { space = this.currentSpace; }
        if(operand.tokentype == "Array") {
            let index = parseInt(operand.children[0].token);
            space.members[operand][index] = parseInt(space.members[operand.token][index]) + v;
        } else {
            space.put(operand, parseInt(space.members[operand.token]) + v);
        }
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
            throw new Exception("Member nicht gefunden");
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
            throw  new Exception("Ungültiger Vergleich");
        }
    }

    call(ast) {
        if(this.skipFunction) { //damit beim initialisieren des Globalscope nicht jede Funktion ausgeführt wird die gefunden wird.
            return null;
        }
        let fnSymbol = ast.scope.resolve(ast.token);
        if(fnSymbol == null) {
            throw new Exception("Funktion nicht gefunden");
        }
        let fspace = new FunctionSpace(fnSymbol);
        let saveSpace = this.currentSpace;
        this.currentSpace = fspace;

        let argcount = ast.children.length;
        if(ast.children.length > 0 && ast.children[0].token === "Block") {
            argcount -= 1;
        }
        let fArgs = fspace.formalArgs();
        if( (fArgs == null && argcount > 0) || fArgs != null && fArgs.length !== argcount) {
            throw new Exception("Ungültiger Funktionsaufruf für " + ast.token);
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
            if(e instanceof Exception) {
                throw e;
            }
            result = e.payload;
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

    print(ast) {
        let o = this.exec(ast.children[0]);
        this.outStr = this.outStr.concat(o);
        this.outStr += "\n";
    }

    loadArrayContent(ast) {
        let space = this.getSpaceWithSymbol(ast.token);
        let v;
        if(space != null) {
            let index = parseInt(ast.children[0].token);
            v = space.members[ast.token][index];
            if(v === undefined) {
                throw new Exception("Array is not assigned");
            }
        }
        return v;
    }

    forLoop(ast) {

        this.exec(ast.children[0]);
        let cond = this.exec(ast.children[1]);
        let i = 0;
        while(cond) {
            this.exec(ast.children[3]);
            this.exec(ast.children[2]);
            cond = this.exec(ast.children[1]);
        }

    }
}

export default Dispatcher;