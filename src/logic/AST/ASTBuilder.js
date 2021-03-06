import TreeMinimizer from "../TreeMinimizer";

class ASTBuilder extends TreeMinimizer {
    symbolicNames;
    start(ctx, symbolicNames) {
        this.symbolicNames = symbolicNames;
        return super.start(ctx);
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
        if (parent.initDeclarator !== undefined && parent.initDeclarator()[0] !== ctx) {
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
           let list = ctx.parentCtx.directDeclarator();
           if(list.length === undefined) {
               list = [list];
           }
           list.push(ctx);
           ctx.parentCtx.directDeclarator = () => {
               return list;
           };
           return this.visitChildren(ctx);
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
        if(ctx.tokenName == "Identifier" && ctx.parentCtx.structOrUnion !== undefined) {
            ctx.getParent().Identifier = () => {return ctx};
        }
        return super.visitTerminal(ctx);
    }

    visitTypedefName(ctx) {
        let parent = ctx.parentCtx;
        if (parent.typedefName !== undefined && parent.typedefName() !== ctx) {
            if(parent.directDeclarator !== undefined && parent.directDeclarator() !== ctx) {
                throw "Hat schon anderen typedefName"
            } else {
                ctx.parentCtx.directDeclarator = () => {
                    return ctx;
                };
                return this.visitChildren(ctx);
            }

        }
        ctx.parentCtx.typedefName = () => {
            return ctx
        };
        return this.visitChildren(ctx);
    }

}

export default ASTBuilder;