const CVisitor = require("../grammar/CVisitor").CVisitor;


class ParseTreeVisitor extends CVisitor {
    start(ctx) {
        console.log((ctx.getText()))
        return this.visitCompilationUnit(ctx.getChild(0));
    }

    visitChildren(ctx) {
        let code = '';
        for(let i = 0; i < ctx.getChildCount(); i++) {
            code+=this.visit(ctx.getChild(i));
        }
        return code;//code.trim();
    }

    visitTerminal(ctx) {
        //return ctx.getText();
        return ctx.getText();
    }

    visitFunctionDefinition(ctx) {
        console.log(ctx.getText())
        return this.visitChildren(ctx)
    }


}

export default ParseTreeVisitor;