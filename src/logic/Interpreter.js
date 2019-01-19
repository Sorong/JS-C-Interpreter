import ParseTreeVisitor from "./ParseTreeVisitor";
import SymbolTableBuilder from "./SymbolTableBuilder";
import TreeMinimizer from "./TreeMinimizer";
import ASTBuilder from "./AST/ASTBuilder";
import UASTBuilder from "./AST/UASTBuilder";
import RefListener from "./RefListener";

const Parser = require("../grammar/CParser").CParser;
const Lexer = require("../grammar/CLexer").CLexer;
const antlr4 = require('antlr4');


class Interpreter {
    treeMinimizer = new ASTBuilder();
    uastBuilder = new UASTBuilder();
    pstVisitor = new ParseTreeVisitor();
    defListener = new SymbolTableBuilder();
    refListener = new RefListener();
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
        antlr4.tree.ParseTreeWalker.DEFAULT.walk(this.defListener, tree);
        let globalScope = this.defListener.globalScope;
        let allScopes = this.defListener.scopes;
        console.log(tree.toStringTree(this.parser.ruleNames));
        let tree2 = this.uastBuilder.start(tree, this.parser.symbolicNames);
        let ast = this.uastBuilder.AST;
        console.log(globalScope.AST.toStringTree(this.parser.ruleNames));
       // this.refListener.setScopes(globalScope, allScopes);
       // antlr4.tree.ParseTreeWalker.DEFAULT.walk(this.refListener, tree);

        return tree.toStringTree(this.parser.ruleNames);

    };

    getParserTree() {
        let tree = this.parser.compilationUnit();
        tree = this.treeMinimizer.start(tree, this.parser.symbolicNames);
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