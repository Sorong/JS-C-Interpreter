import AST from "./AST";
import GlobalScope from "../Scope/GlobalScope";

const CVisitor = require("../../grammar/CVisitor").CVisitor;

class UASTBuilder extends CVisitor {
    AST;
    symbolicNames;
    start(ctx, symbolicNames) {
        this.symbolicNames = symbolicNames;
        this.visitCompilationUnit(ctx);

        return ctx;
    }

    visitChildren(ctx) {

        let astNodes = [];
        for (let i = 0; i < ctx.getChildCount(); i++) {
            let child = ctx.getChild(i);
            if (ctx.scope !== undefined && ctx.scope.ctx !== undefined) {
                delete ctx.scope.ctx;
                astNodes = this.visit(child);
                for(let j = 0; j < astNodes[0].length; j++) {
                    if(astNodes[0][j] != null) {
                        let node = astNodes[0][j];
                        if(node instanceof Array) {
                            node = node[0];
                        }
                        ctx.scope.AST = node;
                        ctx.scope.AST.scope = ctx.scope;
                    }
                }
            } else {

                astNodes.push(this.visit(child));
            }
        }
        return astNodes;
    }
    visitInitDeclarator(ctx) {
        let ast = new AST("=");
        for(let i = 0; i < ctx.getChildCount(); i++) {
            if(ctx.getChild(i).getText() !== "=") {
                let astNode = this.visit(ctx.getChild(i));
                if(astNode !== null) {
                    ast.addChild(astNode);
                }
            }
        }
        return ast;
    }

    visitAdditiveExpression(ctx) {
        let ast = new AST("+");
        for(let i = 0; i < ctx.getChildCount(); i++) {
            if(ctx.getChild(i).getText() !== "+") {
                let astNode = this.visit(ctx.getChild(i));
                if(astNode !== null) {
                    ast.addChild(astNode);
                }
            }
        }
        return ast;
    }

    visitTerminal(ctx) {
        let ast = new AST(ctx.getText());
        if(this.symbolicNames !== undefined && ctx.getSymbol().type < this.symbolicNames.length) {
            ast.tokentype = this.symbolicNames[ctx.getSymbol().type];
            console.log(ast.tokentype);
            if(ast.tokentype == "Semi" || ast.tokentype === undefined) {
                return null;
            }
        }
        return ast;
    }
}

export default UASTBuilder;