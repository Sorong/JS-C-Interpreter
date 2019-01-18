import GlobalScope from "./Scope/GlobalScope";
import BuiltInTypeSymbol from "./Symbol/BuiltInTypeSymbol";
import LocalScope from "./Scope/LocalScope";
import VariableSymbol from "./Symbol/VariableSymbol";
import ScopedSymbol from "./Symbol/ScopedSymbol";
import FunctionSymbol from "./Symbol/FunctionSymbol";

const CListener = require("../grammar/CListener").CListener;

class ParseTreeListener extends CListener {
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
        console.log(this.currentScope);
        this.currentScope = this.currentScope.enclosingScope;
        if (this.currentScope == null) {
            throw "kein Scope mehr am Blockende"
        }

    }

    enterDeclaration(ctx) {

    }

    exitDeclaration(ctx) {
        let type = ctx.typeSpecifier().getText();
        let variable;
        if (ctx.initDeclarator !== undefined) {
            variable = new VariableSymbol(ctx.initDeclarator().directDeclarator().getText(), type);
        } else {
            variable = new VariableSymbol(ctx.directDeclarator().getText(), type)
        }
        this.currentScope.bind(variable);
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
        console.log(this.currentScope);
        this.currentScope = this.currentScope.enclosingScope;
    }

    exitParameterDeclaration(ctx) {
        let type = ctx.typeSpecifier().getText();
        let variable = new VariableSymbol(ctx.directDeclarator().getText(), type);
        this.currentScope.bind(variable);
    }
}

export default ParseTreeListener;