const antlr4 = require('antlr4');

class AST {
    token;
    tokentype;
    children;
    scope;

    constructor(token) {
        this.token = token === undefined ? null : token;
        this.tokentype = null;
        this.children = [];
        this.scope = null;
    }

    addChild(otherAST) {
        if(otherAST == null) {return;}
        if(otherAST instanceof Array) {
            for(let i = 0; i < otherAST.length; i++) {
                if(otherAST[i] != null && otherAST[i].length === undefined) {
                    this.children.push(otherAST[i]);
                    otherAST[i].setScope(this.scope);
                    if(otherAST[i].token === null) {
                        console.log("empty token added");
                    }
                } else if(otherAST[i] != null) {
                    this.addChild(otherAST[i]);
                }
            }
        } else {
            this.children.push(otherAST);
            otherAST.setScope(this.scope);
        }
    }

    setScope(scope) {
        if(this.scope != null) {return;}
        this.scope = scope;
        for(let i = 0; i < this.children.length; i++) {
            this.children[i].setScope(scope);
        }
    }

    getNodeType() {
        return this.tokentype;
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