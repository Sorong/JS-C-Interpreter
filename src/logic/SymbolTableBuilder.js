import GlobalScope from "./Scope/GlobalScope";
import BuiltInTypeSymbol from "./Symbol/BuiltInTypeSymbol";
import LocalScope from "./Scope/LocalScope";
import VariableSymbol from "./Symbol/VariableSymbol";
import ScopedSymbol from "./Symbol/ScopedSymbol";
import FunctionSymbol from "./Symbol/FunctionSymbol";
import StructSymbol from "./Symbol/StructSymbol";
import Exception from "./Util/Exception";

const CListener = require("../grammar/CListener").CListener;

class SymbolTableBuilder extends CListener {
    globalScope;
    currentScope;
    scopes = [];

    enterCompilationUnit(ctx) {
        this.globalScope = new GlobalScope(null);
        this.globalScope.bind(new BuiltInTypeSymbol("print"));
        // this.globalScope.bind(new BuiltInTypeSymbol("char"));
        // //signed + unsinged
        // this.globalScope.bind(new BuiltInTypeSymbol("int"));
        // //unsigned
        // this.globalScope.bind(new BuiltInTypeSymbol("short"));
        // //unsigned
        // this.globalScope.bind(new BuiltInTypeSymbol("long"));
        // //unsignedwür
        // this.globalScope.bind(new BuiltInTypeSymbol("float"));
        // this.globalScope.bind(new BuiltInTypeSymbol("double"));
        // //long

        this.currentScope = this.globalScope;


        this.scopes.push(this.currentScope);
        ctx.scope = this.currentScope;
        this.currentScope.ctx = ctx;
    }

    exitCompilationUnit(ctx) {
        for(let i = 0; i < this.scopes.length; i++) {

            this.scopes[i].scopeNumber = i;
            this.scopes[i].ctx.scopeNumber = i;
        }
        //console.log(this.currentScope);
    }

    enterCompoundStatement(ctx) { //Block { ... }
        this.currentScope = new LocalScope(this.currentScope);

        this.scopes.push(this.currentScope);
        ctx.scope = this.currentScope;
        this.currentScope.ctx = ctx;
    }

    exitCompoundStatement(ctx) {
        this.currentScope = this.currentScope.enclosingScope;
        if (this.currentScope == null) {
            throw new Exception("Kein Scope mehr am Blockenende");
        }

    }

    enterDeclaration(ctx) {

    }

    exitDeclaration(ctx) {
        let typeSpecifer = ctx.typeSpecifier;
        if(typeSpecifer === undefined) {
            typeSpecifer = ctx.typedefName;
        }
        if(typeSpecifer === undefined) {
            return;
        }
        if(ctx.initDeclaratorList() !== undefined) {
            //console.log("declaratorlist");
        }
        let type = typeSpecifer().getText();
        let variable;
        let declaratorList;
        if (ctx.initDeclarator !== undefined) {
            declaratorList = ctx.initDeclarator().directDeclarator();
        } else if(ctx.directDeclarator !== undefined) {
            declaratorList = ctx.directDeclarator()
        } else {
            declaratorList = ctx.initDeclaratorList().directDeclarator();
        }
        if(declaratorList !== undefined) {
            if(declaratorList instanceof Array) {
                for(let i = 0; i < declaratorList.length; i++) {
                    variable = new VariableSymbol(declaratorList[i].getText(), type);
                    if(this.currentScope.resolve(type) == null) {throw new Exception("Typ ist nicht definiert " + type)}
                    this.currentScope.bind(variable);
                }
            } else {
                variable = new VariableSymbol(declaratorList.getText(),type);
                if(this.currentScope.resolve(type) == null) {throw new Exception("Typ ist nicht definiert " + type)}
                this.currentScope.resolve(type);
                this.currentScope.bind(variable);
            }

        }

    }


    exitPrimaryExpression(ctx) {
        if(ctx.getChild(0).tokenName === undefined || ctx.getChild(0).tokenName !== "Constant") {
            let variable = this.currentScope.resolve(ctx.getText());
            if(variable == null) {
                throw new Exception("Variable nicht gefunden: " + ctx.getText().toString());
            }
        }
    }

    enterFunctionDefinition(ctx) {
        let type = ctx.typeSpecifier().getText();
        let name = ctx.directDeclarator().directDeclarator().getText();
        let func = new FunctionSymbol(name, type, this.currentScope);
        this.currentScope.bind(func);
        this.currentScope = func;


        this.scopes.push(this.currentScope);
        ctx.scope = this.currentScope;
        this.currentScope.ctx = ctx;
    }

    exitFunctionDefinition(ctx) {
        this.currentScope = this.currentScope.enclosingScope;
    }

    exitParameterDeclaration(ctx) {
        let type = ctx.typeSpecifier().getText();
        let variable = new VariableSymbol(ctx.directDeclarator().getText(), type);
        this.currentScope.bind(variable);
    }

    exitPostfixExpression(ctx) {
        let name = ctx.primaryExpression().getText();
        let func = this.currentScope.resolve(name);
        if(func == null) {
            throw  new Exception("Funktion nicht gefunden");
        }

        if(func instanceof VariableSymbol && !func.isArray()) {
            let struct = this.currentScope.resolve(func.type);
            if(ctx.Identifier() == null) {return;}
            if(struct instanceof StructSymbol) {
                func = struct.resolveMember(ctx.Identifier().getText()); // "."Operator gefolgt vom Identifier A a; a. --> b <--
                if(func == null) {
                    throw new Exception("Member: " + name + " nicht gefunden");
                }
            } else {
                throw new Exception(name + " ist keine Funktion");
            }
        }

        //primaryExpression = funktionsname
    }
    enterStructOrUnionSpecifier(ctx) {
        let type = ctx.structOrUnion().getText();
        let name = ctx.Identifier().getText();
        let struct = new StructSymbol(name, type, this.currentScope);
        this.currentScope.bind(struct);
        this.currentScope = struct;

        this.scopes.push(this.currentScope);

        this.currentScope.ctx = ctx;
    }
    exitStructOrUnionSpecifier(ctx) {
      this.currentScope = this.currentScope.enclosingScope;
    }

    enterSpecifierQualifierList(ctx) {

    }

    exitSpecifierQualifierList(ctx) {
        let type = ctx.typeSpecifier().getText();
        let typedef = this.currentScope.resolve(type);
        if(typedef == null) {
            throw new Exception("Unbekannter Typ: " + type);
        }

        let name = ctx.typedefName().getText();
        let variable = new VariableSymbol(name, type);
        this.currentScope.bind(variable);
    }

    enterForDeclaration(ctx) {

    }

    exitForDeclaration(ctx) {
        this.exitDeclaration(ctx);
    }
}

export default SymbolTableBuilder;