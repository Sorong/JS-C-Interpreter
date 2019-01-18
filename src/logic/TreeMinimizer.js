import {CVisitor} from "../grammar/CVisitor";
import AST from "./AST/AST";

class TreeMinimizer extends CVisitor {
    start(ctx) {
        this.visitCompilationUnit(ctx);

        return ctx;
    }

    visitCompilationUnit(ctx) {
        return this.visit(ctx.getChild(0))
    }

    visitChildren(ctx) {
        let code = '';
        for(let i = 0; i < ctx.getChildCount(); i++) {
            //Letztes Child wird behalten
            let child = ctx.getChild(i);
            while(child.getChildCount() == 1 && child.getChild(0) != child.getText()) {

                child = child.getChild(0);
                child.parentCtx = ctx;
                ctx.children[i] = child;
                //Erstes Child wird behalten
            // if(ctx.getChildCount() == 1) {
            //     let child = ctx.getChild(0);
            //     while(child.getChildCount() == 1) {
            //         child = child.getChild(0);
            //         child.parentCtx = ctx;
            //         ctx.children[i] = child;
             //   }
             }

            code+=this.visit(ctx.getChild(i));
        }
        return code;
    }

    visitTerminal(ctx) {
        return ctx.getText();
    }
}

export default TreeMinimizer;
