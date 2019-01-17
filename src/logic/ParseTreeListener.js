import GlobalScope from "./GlobalScope";
import BuiltInTypeSymbol from "./BuiltInTypeSymbol";
import LocalScope from "./LocalScope";
import VariableSymbol from "./VariableSymbol";

const CListener = require("../grammar/CListener").CListener;

class ParseTreeListener extends CListener {
    scope;
    enterCompilationUnit(ctx) {
        let globals = new GlobalScope(null);
        globals.bind(new BuiltInTypeSymbol("char"));
        //signed + unsinged
        globals.bind(new BuiltInTypeSymbol("int"));
        //unsigned
        globals.bind(new BuiltInTypeSymbol("short"));
        //unsigned
        globals.bind(new BuiltInTypeSymbol("long"));
        //unsigned
        globals.bind(new BuiltInTypeSymbol("float"));
        globals.bind(new BuiltInTypeSymbol("double"));
        //long
        this.scope = globals;
        console.log(ctx.getText())
    }
    enterCompoundStatement(ctx) { //Block { ... }
        this.scope = new LocalScope(this.scope);
    }
    exitCompoundStatement(ctx) {
        this.scope = this.scope.enclosingScope;
    }
    enterDeclaration(ctx) {

    }
    exitDeclaration(ctx) {
      //  let t = this.scope.resolve(ctx.typeSpecifier.getText());
       // let variable = new VariableSymbol(ctx.Identifier.getText(), t)
       // this.scope.bind(variable);
    }

    exitAssignmentExpression(ctx) {
        //console.log(ctx.getText());
    }

    exitTypeSpecifier(ctx) {
        //console.log(ctx.getText())
    }
}

export default ParseTreeListener;