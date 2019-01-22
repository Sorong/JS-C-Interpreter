import ParseTreeVisitor from "./ParseTreeVisitor";
import SymbolTableBuilder from "./SymbolTableBuilder";
import TreeMinimizer from "./TreeMinimizer";
import ASTBuilder from "./AST/ASTBuilder";
import UASTBuilder from "./AST/UASTBuilder";
import RefListener from "./RefListener";
import Dispatcher from "./Dispatcher/Dispatcher";
import Exception from "./Util/Exception";

const Parser = require("../grammar/CParser").CParser;
const Lexer = require("../grammar/CLexer").CLexer;
const antlr4 = require('antlr4');


class Interpreter {
    treeMinimizer = new ASTBuilder();
    uastBuilder = new UASTBuilder();
    pstVisitor = new ParseTreeVisitor();
    defListener = new SymbolTableBuilder();
    refListener = new RefListener();
    dispatcher = new Dispatcher();
    chars;
    lexer;
    tokens;
    parser;
    initMember() {
        this.treeMinimizer = new ASTBuilder();
        this.uastBuilder = new UASTBuilder();
        this.defListener = new SymbolTableBuilder();
        this.dispatcher = new Dispatcher();
    }

    init = (input) => {
        this.initMember();
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
        try {
            antlr4.tree.ParseTreeWalker.DEFAULT.walk(this.defListener, tree);
        } catch (e) {
            return e.msg;
        }

        let globalScope = this.defListener.globalScope;
        let allScopes = this.defListener.scopes;

        let tree2 = this.uastBuilder.start(tree, this.parser.symbolicNames);
        let ast = this.uastBuilder.AST;
        for(let i = 0; i < allScopes.length; i++) {
            if(allScopes[i].AST === undefined) {
                console.log(allScopes[i] + " has no AST");
                continue;
            }
            console.log(allScopes[i].AST.toStringTree(this.parser.ruleNames));
        }
        this.dispatcher.globalScope = globalScope;
       // this.refListener.setScopes(globalScope, allScopes);
       // antlr4.tree.ParseTreeWalker.DEFAULT.walk(this.refListener, tree);

        let finish = "";
        try {
            let out = this.dispatcher.executeCode("main");
            finish += this.dispatcher.outStr;
            finish += "ExitCode: " + out;
        } catch (e) {
            if(e instanceof Exception) {
                return e.msg;
            }
            finish += this.dispatcher.outStr;
            finish += "ExitCode: " + e;
        }
        return finish;

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