import ParseTreeVisitor from "./ParseTreeVisitor";
import ParseTreeListener from "./ParseTreeListener";
import ASTBuilder from "./ASTBuilder";

const Parser = require("../grammar/CParser").CParser;
const Lexer = require("../grammar/CLexer").CLexer;
const antlr4 = require('antlr4');


class Interpreter {
    astBuilder = new ASTBuilder();
    pstVisitor = new ParseTreeVisitor();
    pstListener = new ParseTreeListener();
    chars;
    lexer;
    tokens;
    parser;

    init = (input) => {
        this.chars = new antlr4.InputStream(input);
        this.lexer = new Lexer(this.chars);

        this.lexer.strictMode = false;

        this.tokens = new antlr4.CommonTokenStream(this.lexer);
        this.parser = new Parser(this.tokens);
        this.parser.buildParseTrees = true;
    };

    interpret(input) {
        this.init(input);
        let tree = this.getParserTree();
        console.log(tree.toStringTree(this.parser.ruleNames));
        //Visitor
        let ast = this.astBuilder.start(tree);
        console.log(ast);
        //let out = this.astBuilder.visit(tree);
        //Listener
        antlr4.tree.ParseTreeWalker.DEFAULT.walk(this.pstListener, ast);
        //let out = this.getTokenList();
        //this.init(input);
        //out += this.getParserTree();
        //out = alles
        //console.log(tree.toStringTree(this.parser.ruleNames));
        return ast.toStringTree(this.parser.ruleNames);//tree.toStringTree(this.parser.ruleNames);
        //parser.buildParseTrees = true;

    };

    getParserTree() {
        //parser.buildParseTrees = true;
        let tree = this.parser.compilationUnit();
        //End Tutorial
        //return tree.toStringTree(this.parser.ruleNames);
        return tree;
    };

    getTokenList() {
        let t = this.lexer.nextToken();
        let out = '';
        while (t.type != antlr4.Token.EOF) {
            out += t;
            out += '\n';
            t = this.lexer.nextToken();
        }
        return out;
    }
}

export default Interpreter;