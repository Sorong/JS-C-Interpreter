import GlobalScope from "./Scope/GlobalScope";
import BuiltInTypeSymbol from "./Symbol/BuiltInTypeSymbol";
import LocalScope from "./Scope/LocalScope";
import VariableSymbol from "./Symbol/VariableSymbol";
import ScopedSymbol from "./Symbol/ScopedSymbol";
import FunctionSymbol from "./Symbol/FunctionSymbol";
import StructSymbol from "./Symbol/StructSymbol";

const CListener = require("../grammar/CListener").CListener;

class SymbolTableBuilder extends CListener {
    globalScope;
    currentScope;

    enterCompilationUnit(ctx) {
        this.globalScope = new GlobalScope(null);
        // this.globalScope.bind(new BuiltInTypeSymbol("char"));
        // //signed + unsinged
        // this.globalScope.bind(new BuiltInTypeSymbol("int"));
        // //unsigned
        // this.globalScope.bind(new BuiltInTypeSymbol("short"));
        // //unsigned
        // this.globalScope.bind(new BuiltInTypeSymbol("long"));
        // //unsigned
        // this.globalScope.bind(new BuiltInTypeSymbol("float"));
        // this.globalScope.bind(new BuiltInTypeSymbol("double"));
        // //long

        this.currentScope = this.globalScope;
    }

    exitCompilationUnit(ctx) {
        console.log(this.currentScope);
    }

    enterCompoundStatement(ctx) { //Block { ... }
        this.currentScope = new LocalScope(this.currentScope);
    }

    exitCompoundStatement(ctx) {
        this.currentScope = this.currentScope.enclosingScope;
        if (this.currentScope == null) {
            throw "kein Scope mehr am Blockende"
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
            console.log("declaratorlist");
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
            for(let i = 0; i < declaratorList.length; i++) {
                variable = new VariableSymbol(declaratorList[i].getText(), type);
                this.currentScope.bind(variable);
            }
        }

    }


    exitPrimaryExpression(ctx) {
        if(ctx.getChild(0).tokenName === undefined || ctx.getChild(0).tokenName !== "Constant") {
            let variable = this.currentScope.resolve(ctx.getText());
            if(variable == null) {
                throw ctx.getText().toString() + " nicht gefunden";
            }
        }
    }

    enterFunctionDefinition(ctx) {
        let type = ctx.typeSpecifier().getText();
        let name = ctx.directDeclarator().directDeclarator().getText();
        let func = new FunctionSymbol(name, type, this.currentScope);
        this.currentScope.bind(func);
        this.currentScope = func;
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
            throw "Funktion nicht vorhanden";
        }

        if(func instanceof VariableSymbol) {
            let struct = this.currentScope.resolve(func.type);
            if(struct instanceof StructSymbol) {
                func = struct.resolveMember(ctx.Identifier().getText()); // "."Operator gefolgt vom Identifier A a; a. --> b <--
                if(func == null) {
                    throw name + " existiert nicht im struct";
                }
            } else {
                throw name + " ist keine Funktion";
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
            throw "Typ ist unbekannt " + type;
        }

        let name = ctx.typedefName().getText();
        let variable = new VariableSymbol(name, type);
        this.currentScope.bind(variable);
    }
}

export default SymbolTableBuilder;