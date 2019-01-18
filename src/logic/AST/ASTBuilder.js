import TreeMinimizer from "../TreeMinimizer";

class ASTBuilder extends TreeMinimizer {
    symbolicNames;
    start(ctx, symbolicNames) {
        this.symbolicNames = symbolicNames;
        return super.start(ctx);
    }

    visitInitDeclarator(ctx) {
        return this.visitChildren(ctx);
    }

    visitTypeSpecifier(ctx) {
        let parent = ctx.parentCtx;
        if (parent.typeSpecifier !== undefined && parent.typeSpecifier() !== ctx) {
            throw "Hat schon anderen TypeSpecifier"
        }
        ctx.parentCtx.typeSpecifier = () => {
            return ctx
        };
        return this.visitChildren(ctx);
    }

    visitInitDeclarator(ctx) {
        let parent = ctx.parentCtx;
        if (parent.initDeclarator !== undefined && parent.initDeclarator() !== ctx) {
            throw "Hat schon anderen InitDeclarator"
        }
        ctx.parentCtx.initDeclarator = () => {
            return ctx
        };
        return this.visitChildren(ctx);
    }

    visitDirectDeclarator(ctx) {
        let parent = ctx.parentCtx;
        if (parent.directDeclarator !== undefined && parent.directDeclarator() !== ctx) {
            throw "Hat schon anderen DirectDeclarator"
        }
        ctx.parentCtx.directDeclarator = () => {
            return ctx
        };
        return this.visitChildren(ctx);
    }

    visitAssignmentExpression(ctx) {
        if (ctx.leftOperand === undefined) {
            ctx.leftOperand = null;
        }
        if (ctx.rightOperand === undefined) {
            ctx.rightOperand = null;
        }
        return this.visitChildren(ctx);
    }

    visitPrimaryExpression(ctx) {
        let parent = ctx.parentCtx;
        if (parent.leftOperand == null) {
            parent.leftOperand = () => {
                return ctx;
            };
            return this.visitChildren(ctx);
        } else if (parent.rightOperand == null) {
            parent.rightOperand = () => {
                return ctx;
            };
            return this.visitChildren(ctx);
        } else if (parent.primaryExpression !== undefined && parent.primaryExpression() !== ctx) {
            throw "Hat schon andere PrimaryExpression"
        }
        ctx.parentCtx.primaryExpression = () => {
            return ctx
        };
        return this.visitChildren(ctx);
    }

    visitTerminal(ctx) {
        if(this.symbolicNames !== undefined && ctx.getSymbol().type < this.symbolicNames.length) {
            ctx.tokenName = this.symbolicNames[ctx.getSymbol().type];
        }
        return super.visitTerminal(ctx);
    }

}

export default ASTBuilder;