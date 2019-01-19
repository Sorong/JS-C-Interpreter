const antlr4 = require('antlr4');

class AST {
    token;
    tokentype;
    children;

    constructor(token) {
        this.token = token == undefined ? null : token;
        this.children = [];
    }

    addChild(otherAST) {
        if(otherAST instanceof Array) {
            if(otherAST.length > 1) {
                throw "OtherAST is array and size is > 1; invalid AST";
            }
            otherAST = otherAST[0];
        }
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