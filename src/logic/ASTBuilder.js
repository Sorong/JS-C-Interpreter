import {CVisitor} from "../grammar/CVisitor";
import AST from "./AST/AST";

class ASTBuilder extends CVisitor {
    AST;
    start(ctx) {
        this.AST = ctx;
        this.visitCompilationUnit(ctx);

        return ctx;
        //return this.AST;
    }

    // visitAssignmentExpression(ctx) {
    //     if(ctx.getChildCount() == 1) {
    //         let test = this.visit(ctx.getChild(0));
    //         this.AST.addChild(new AST(test));
    //     } else if (ctx.getChildCount() == 3) {
    //         let currentAST = new AST(ctx.getChild(0)); //Mitte Wurzel
    //         currentAST.addChild(new AST(ctx.getChild(0))); //Left
    //         currentAST.addChild(new AST(ctx.getChild(2))); //Right
    //         this.AST.addChild(currentAST);
    //     } else {
    //         console.log("visitAssigmnentExpression unknown");
    //     }
    //     return null;
    // }

    //
    visitCompilationUnit(ctx) {
        return this.visit(ctx.getChild(0))
    }

    visitChildren(ctx) {
        let code = '';
        for(let i = 0; i < ctx.getChildCount(); i++) {
            let child = ctx.getChild(i);
            while(child.getChildCount() == 1 && child.getChild(0) != child.getText()) {
                child = child.getChild(0);
                child.parentCtx = ctx;
                ctx.children[i] = child;
            }
            code+=this.visit(ctx.getChild(i));
        }
        return code;//code.trim();
    }

    visitTerminal(ctx) {
        //return ctx.getText();
        return ctx.getText();
    }
}

export default ASTBuilder;
