import TokenStream from "../util/tokenStream";
import TokenType from "../lexing/tokenType";
import Parser from "../parsing";
import { Token } from "../lexing/lexer";
import Type from "../parsing/type";
import Int from "../parsing/int";
import BitSize from "../util/bitsize";
import Prototype from "../parsing/prototype";
import String from "../parsing/string";
import Function from "../parsing/function";
import Block from "../parsing/block";

test("it parses int", () => {
    const ts = new TokenStream([new Token(TokenType.Int, "100")]);
    const parser = new Parser(ts);
    expect(parser.parseInt()).toEqual(new Int(BitSize.B64, false, 100));
});

test("it parses arg", () => {
    const ts = new TokenStream([
        new Token(TokenType.Identifier, "world"),
        new Token(TokenType.SymbolColon, ":"),
        new Token(TokenType.KeywordMut, "mut"),
        new Token(TokenType.Identifier, "string")
    ]);
    const parser = new Parser(ts);
    expect(parser.parseArg()).toEqual(["world", new Type(true, "string")]);
});

test("it parses type", () => {
    const ts = new TokenStream([
        new Token(TokenType.KeywordMut, "mut"),
        new Token(TokenType.Identifier, "string")
    ]);
    const parser = new Parser(ts);
    expect(parser.parseType()).toEqual(new Type(true, "string"));
});

test("it parses prototype", () => {
    const ts = new TokenStream([
        new Token(TokenType.Identifier, "hello"),
        new Token(TokenType.SymbolOpenParen, "("),
        new Token(TokenType.Identifier, "world"),
        new Token(TokenType.SymbolColon, ":"),
        new Token(TokenType.KeywordMut, "mut"),
        new Token(TokenType.Identifier, "string"),
        new Token(TokenType.SymbolCloseParen, ")"),
        new Token(TokenType.Identifier, "string")
    ]);
    const parser = new Parser(ts);
    expect(parser.parsePrototype()).toEqual(
        new Prototype(
            "hello",
            [["world", new Type(true, "string")]],
            new Type(false, "string")
        )
    );
});
test("it parses string", () => {
    const ts = new TokenStream([new Token(TokenType.String, `hello"`)]);
    const parser = new Parser(ts);
    expect(parser.parseString()).toEqual(new String("hello"));
});
test("it parses function", () => {
    const ts = new TokenStream([
        new Token(TokenType.KeywordFn, "fn"),
        new Token(TokenType.Identifier, "main"),
        new Token(TokenType.SymbolOpenParen, "("),
        new Token(TokenType.Identifier, "world"),
        new Token(TokenType.SymbolColon, ":"),
        new Token(TokenType.KeywordMut, "mut"),
        new Token(TokenType.Identifier, "string"),
        new Token(TokenType.SymbolCloseParen, ")"),
        new Token(TokenType.Identifier, "string"),
        new Token(TokenType.SymbolOpenBrace, "{"),
        new Token(TokenType.SymbolCloseBrace, "}")
    ]);
    const parser = new Parser(ts);
    expect(parser.parseFunction()).toEqual(
        new Function(
            new Prototype(
                "main",
                [["world", new Type(true, "string")]],
                new Type(false, "string")
            ),
            new Block([])
        )
    );
});

test.todo("it parses block");
