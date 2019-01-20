import AST from "./AST";
import GlobalScope from "../Scope/GlobalScope";
import {Operator} from "../util/Operator";

const CVisitor = require("../../grammar/CVisitor").CVisitor;


class UASTBuilder extends CVisitor {
    AST;
    symbolicNames;

    start(ctx, symbolicNames) {
        this.symbolicNames = symbolicNames;
        this.visitCompilationUnit(ctx);

        return ctx;
    }

    addASTNodesToCurrentScope(scope, astNodes) {
        for (let j = 0; j < astNodes.length; j++) {
            if (astNodes[j] == null) {
                continue;
            }
            if(astNodes[j] instanceof AST) {
                scope.AST.addChild(astNodes[j]);
            } else {
                for (let k = 0; k < astNodes[j].length; k++) {

                    let node = astNodes[j][k];
                    if (node != null) {
                        scope.AST.addChild(node);
                    }

                }
            }
        }
    }

    visitChildren(ctx) {

        let astNodes = [];
        for (let i = 0; i < ctx.getChildCount(); i++) {
            let child = ctx.getChild(i);
            if (ctx.scope !== undefined) {
                if (ctx.scope.ctx !== undefined) {
                    delete ctx.scope.ctx;
                }
                if (ctx.scope.AST === undefined || ctx.scope.AST === null) {
                    ctx.scope.AST = new AST("Block");
                    ctx.scope.AST.tokentype = "Block";
                    ctx.scope.AST.scope = ctx.scope;
                }
                astNodes = this.visit(child);
                if (astNodes == null) {
                    continue;
                }
                this.addASTNodesToCurrentScope(ctx.scope, astNodes);
            } else {
                if (astNodes != null) {
                    astNodes.push(this.visit(child));
                }

            }
        }
        return astNodes;
    }

    visitCompoundStatement(ctx) {
        return this.visitChildren(ctx);
    }

    visitInitDeclarator(ctx) {
        let ast = new AST("=");
        for (let i = 0; i < ctx.getChildCount(); i++) {
            let astNode = this.visit(ctx.getChild(i));
            if (astNode !== null) {
                if (i === 1 && Operator[astNode.token] !== undefined) {
                    ast.tokentype = Operator[astNode.token];
                    ast.token = astNode.token;
                } else {
                    ast.addChild(astNode);
                }
            }
        }
        return ast;
    }

    visitAssignmentExpression(ctx) {
        let ast = new AST();
        for (let i = 0; i < ctx.getChildCount(); i++) {
            let astNode = this.visit(ctx.getChild(i));
            if (astNode !== null && astNode.length > 0) {
                if (Operator[astNode[0].token] !== undefined) {
                    ast.tokentype = Operator[astNode[0].token];
                    ast.token = astNode[0].token;
                } else {
                    ast.addChild(astNode);
                }
            } else if(astNode !== null) {
                ast.addChild(astNode);
            }
        }
        return ast;
    }

    visitAdditiveExpression(ctx) {
        let ast = new AST();
        for (let i = 0; i < ctx.getChildCount(); i++) {
            let astNode = this.visit(ctx.getChild(i));
            if (astNode !== null) {
                if (i === 1 && Operator[astNode.token] !== undefined) {
                    ast.tokentype = Operator[astNode.token];
                    ast.token = astNode.token;
                } else {
                    ast.addChild(astNode);
                }
            }
        }
        return ast;
    }

    visitPostfixExpression(ctx) { //z.B.  Funktionaufruf
        let ast = new AST();
        ast.tokentype = "Function";
        for (let i = 0; i < ctx.getChildCount(); i++) {
            let astNode = this.visit(ctx.getChild(i));
            if (i === 0 && astNode != null) {
                if (astNode[0].tokentype === Operator["Identifier"]) {
                    ast.token = ctx.getChild(i).getText();
                }
            } else if (astNode !== null) {
                ast.addChild(astNode);
            }
        }
        return ast;
    }

    visitStructOrUnionSpecifier(ctx) {
        return null;
    }

    visitTerminal(ctx) {
        let ast = new AST(ctx.getText());
        if (this.symbolicNames !== undefined && ctx.getSymbol().type < this.symbolicNames.length) {

            ast.tokentype = this.symbolicNames[ctx.getSymbol().type];
            if (Operator[ast.tokentype] === undefined) {
                ast.tokentype = Operator[ctx.getText()]
            }//this.symbolicNames[ctx.getSymbol().type];
            //console.log(ast.tokentype);
            if (ast.tokentype === undefined) {
                return null;
            }
        }
        return ast;
    }

    visitJumpStatement(ctx) {
        let ast = new AST();
        for (let i = 0; i < ctx.getChildCount(); i++) {
            let astNode = this.visit(ctx.getChild(i));
            if (astNode !== null) {
                if (Operator[astNode.token] !== undefined) {
                    ast.tokentype = Operator[astNode.token];
                    ast.token = astNode.token;
                } else {
                    ast.addChild(astNode);
                }
            }
        }
        return ast;
    }
}

export default UASTBuilder;