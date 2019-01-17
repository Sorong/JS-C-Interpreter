const antlr4 = require('antlr4');

class AST extends antlr4.tree.Trees{
    token;
    children;

    constructor(token) {
        super();
        this.token = token;
        this.children = [];
    }

    addChild(otherAST) {
        if(otherAST != null) {
            this.children.push(otherAST);
        }
    }

    getNodeType() {
        return this.token.type;
    }

    isNull() {
        return this.token == null;
    }

    toString(rulenames) {
        return this.isNull() ? 'null' : this.token.toString(rulenames);
    }

    toStringTree(rulenames) {
        if(this.children.length == 0) { return this.toString(rulenames);}
        let strOut = "";
        if(!this.isNull()) {
            strOut += "(";
            strOut += this.toString(rulenames);
            strOut += ' ';
        }
        for(let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            if(i > 0) {
                strOut += ' ';
            }
            strOut += child.toStringTree(rulenames);
        }
        if(!this.isNull()) {strOut += ")";}
        return strOut;
    }

}

export default AST;