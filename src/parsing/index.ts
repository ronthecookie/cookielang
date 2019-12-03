import TokenStream from "../util/tokenStream";
import Int from "./values/int";
import BitSize from "../util/bitsize";
import Type from "./type";
import TokenType from "../lexing/tokenType";
import Arg from "./arg";
import Prototype from "./prototype";
import Block from "./block";
import Function from "./function";
import VarDeclareStatement from "./statements/vardeclare";
import Node from "./node";
import String from "./values/string";
import Statement from "./statement";
import Value from "./value";

export default class Parser {
    ts: TokenStream;
    constructor(ts: TokenStream) {
        this.ts = ts;
    }

    parseTopLevel(): Node {
        switch (this.ts.get().type) {
            case TokenType.KeywordFn:
                return this.parseFunction();

            default:
                throw new Error(
                    "Token is of an unexpected type for the top level"
                );
        }
    }

    parseInt(): Int {
        // 1337
        return new Int(parseInt(this.ts.get().match));
    }
    parseType(): Type {
        // mut string OR string
        if (this.ts.get().type == TokenType.KeywordMut) {
            return new Type(
                true,
                this.ts.next().expectType(TokenType.Identifier).match
            );
        } else {
            const tv = this.ts.get().expectType(TokenType.Identifier).match;
            this.ts.skip();
            return new Type(false, tv);
        }
    }
    parseArg(): Arg {
        // world: mut string
        const id = this.ts.get().expectType(TokenType.Identifier);
        this.ts.skip();
        this.ts.skipOver(TokenType.SymbolColon);
        return [id.match, this.parseType()];
    }
    parsePrototype(): Prototype {
        // hello (world: mut string) string
        const name = this.ts.get().expectType(TokenType.Identifier);
        this.ts.skip();
        this.ts.skipOver(TokenType.SymbolOpenParen);
        // TODO: Use while loop to parse optional arg(s).
        const args = [this.parseArg()];
        this.ts.skip();
        this.ts.skipOver(TokenType.SymbolCloseParen);
        const returnType = this.parseType();
        return new Prototype(name.match, args, returnType);
    }
    parseBlock(): Block {
        // { (statements) }
        this.ts.skipOver(TokenType.SymbolOpenBrace);
        const statements: Statement[] = [];
        while (this.ts.get().type !== TokenType.SymbolCloseBrace) {
            statements.push(this.parseStatement())
        }
        this.ts.skipOver(TokenType.SymbolCloseBrace);
        return new Block(statements);
    }
    parseFunction(): Function {
        // fn <PROTO> <BLOCk>
        this.ts.skipOver(TokenType.KeywordFn);
        return new Function(this.parsePrototype(), this.parseBlock());
    }
    parseString(): String {
        const tok = this.ts.get().expectType(TokenType.String);
        return new String(tok.match.slice(0, -1));
    }
    parseStatement(): Statement {
        switch (this.ts.get().type) {
            case TokenType.Identifier:
                if (this.ts.peek().type == TokenType.Identifier) {
                    return this.parseVarDeclareStatement();
                }
            default:
                throw new Error("unknown statement type")
        }
    }
    parseVarDeclareStatement(): VarDeclareStatement {
        // int foobar [= 123]
        const type = this.parseType();
        const id = this.ts.get().expectType(TokenType.Identifier);
        this.ts.next();
        // TODO: Assigning value should be optional.
        this.ts.skipOver(TokenType.SymbolEqual);
        const value = this.parseValue();
        this.ts.skip();
        return new VarDeclareStatement(
            id.match,
            type,
            value
        );
    }
    parseValue(): Value {
        switch (this.ts.get().type) {
            case TokenType.Int:
                return this.parseInt();
            case TokenType.String:
                return this.parseString();

            // TODO: Missing decimal case.

            default:
                throw new Error("unknown value type")
        }
    }
}
