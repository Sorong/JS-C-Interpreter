import AST from "./AST";
import GlobalScope from "../Scope/GlobalScope";

const CVisitor = require("../../grammar/CVisitor").CVisitor;
const Operator =
    {
        'Constant': 'Constant',
        'Identifier': 'Identifier',
        'return': 'Return',
        '<': 'Less',
        '<=': 'LessEqual',
        '>': 'Greater',
        '>=': 'GreaterEqual',
        '<<': 'LeftShift',
        '>>': 'RightShift',
        '+': 'Plus',
        '++': 'PlusPlus',
        '-': 'Minus',
        '--': 'MinusMinus',
        '*': 'Star',
        '/': 'Div',
        '%': 'Mod',
        '&': 'And',
        '|': 'Or',
        '&&': 'AndAnd',
        '||': 'OrOr',
        '^': 'Caret',
        '!': 'Not',
        '~': 'Tilde',
        '?': 'Question',
        ':': 'colon',
        ',': 'Comma',
        '=': 'Assign',
// '*=' | '/=' | '%=' | '+=' | '-=' | '<<=' | '>>=' | '&=' | '^=' | '|='
    '*=': 'StarAssign',
    '/=': 'DivAssign',
    ModAssign: '%=',
    PlusAssign: '+=',
    MinusAssign: '-=',
    LeftShiftAssign: '<<=',
    RightShiftAssign: '>>=',
    AndAssign: '&=',
    XorAssign: '^=',
    OrAssign: '|=',
    Equal: '==',
    NotEqual: '!=',
    Arrow: '->',
    Dot: '.',
    Ellipsis: '...'
};

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
            if (ctx.scope !== undefined) {
                if (ctx.scope.ctx !== undefined) {
                    delete ctx.scope.ctx;
                }
                if (ctx.scope.AST === undefined || ctx.scope.AST === null) {
                    ctx.scope.AST = new AST();
                    ctx.scope.AST.scope = ctx.scope;
                }
                astNodes = this.visit(child);
                if (astNodes == null) {
                    continue;
                }
                for (let j = 0; j < astNodes.length; j++) {
                    if (astNodes[j] == null) {
                        continue;
                    }
                    for (let k = 0; k < astNodes[j].length; k++) {
                        if (astNodes[j] != null) {
                            let node = astNodes[j][k];
                            if (node instanceof Array) {
                                node = node[0];
                            }
                            if (node != null) {
                                ctx.scope.AST.addChild(node);
                            }
                        }
                    }

                }

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
            if (ctx.getChild(i).getText() !== "=") {
                let astNode = this.visit(ctx.getChild(i));
                if (astNode !== null) {
                    ast.addChild(astNode);
                }
            }
        }
        return ast;
    }

    visitInitDeclarator(ctx) { //int i,j; removed from tree
        return null;
    }

    visitAssignmentExpression(ctx) {
        let ast = new AST("=");
        for (let i = 0; i < ctx.getChildCount(); i++) {
            if (ctx.getChild(i).getText() !== "=") {
                let astNode = this.visit(ctx.getChild(i));
                if (astNode !== null) {
                    ast.addChild(astNode);
                }
            }
        }
        return ast;
    }

    visitAdditiveExpression(ctx) {
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

            ast.tokentype = this.symbolicNames[ctx.getSymbol().type]
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
}

export default UASTBuilder;