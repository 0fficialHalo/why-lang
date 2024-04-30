export enum TokenType {
	// Literal Types
	Number,
    String,
	Identifier,

	// Keywords
	Let,
    Const,
    Func,
    If,
    Else,
    For,

	// Grouping * Operators
	BinaryOperator,
	Equals, // =
    Comma, // ,
    Dot, // .
    Colon, // :
    Semicolon, // ;
	OpenParen, // (
	CloseParen, // )
    OpenBrace, // {
    CloseBrace, // }
    OpenBracket, // [
    CloseBracket, // ]
    Greater, // >
    Lesser, // <
    EqualsCompare, // ==
    NotEqualsCompare, // !=
    Exclamation, // !
    And, // &&
    Ampersand, // &
    Bar, // |
    Ternary, // ->

    // Marks the end of file
    EOF,
}

const KEYWORDS: Record<string, TokenType> = {
    let: TokenType.Let,
    const: TokenType.Const,
    func: TokenType.Func,
    if: TokenType.If,
    else: TokenType.Else,
    for: TokenType.For,
};

const ESCAPED: Record<string, string> = {
    n: "\n",
    t: "\t",
    r: "\r",
};

const TOKEN_KEYS: Record<string, TokenType> = {
    "(": TokenType.OpenParen,
    ")": TokenType.CloseParen,
    "[": TokenType.OpenBracket,
    "]": TokenType.CloseBracket,
    "{": TokenType.OpenBrace,
    "}": TokenType.CloseBrace,
    "+": TokenType.BinaryOperator,
    "-": TokenType.BinaryOperator,
    "*": TokenType.BinaryOperator,
    "/": TokenType.BinaryOperator,
    "%": TokenType.BinaryOperator,
    "=": TokenType.Equals,
    ";": TokenType.Semicolon,
    ":": TokenType.Colon,
    ",": TokenType.Comma,
    ".": TokenType.Dot,
}

export interface Token {
    value: string;
    type: TokenType;
    raw: string;
};

function token(value: string = "", type: TokenType, raw: string = value): Token {
    return { value, type, raw };
}

function isAlpha(src: string) {
    return src.toUpperCase() != src.toLowerCase();
};

function isSkippable(str: string) {
    return str == " " || str == "\n" || str == "\t" || str == "\r";
};

function isInt(str: string) {
    const c = str.charCodeAt(0);
	const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];

	return c >= bounds[0] && c <= bounds[1];
};

function getPrevIdents(tokens: Array<Token>): Token[] {
    const reversed = [...tokens].reverse();
    const newTokens: Token[] = [];
    for(const token of reversed) {
        if(token.type == TokenType.Identifier ||
            token.type == TokenType.Dot ||
            token.type == TokenType.OpenBracket ||
            token.type == TokenType.CloseBracket ||
            (tokens[tokens.length - newTokens.length - 2] && tokens[tokens.length - newTokens.length - 2].type == TokenType.OpenBracket && token.type == TokenType.Number)) {
                newTokens.push(token);
            } else {
                break;
            }
    }

    return (newTokens.length > 0 ? newTokens.reverse() : null) as Token[];
}

export function tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("")

    while (src.length > 0) {
        const char = src[0];
        const tokenType = TOKEN_KEYS[char]

        if (isInt(char) || (char == "-" && isInt(src[1]))) {
            let num = src.shift();
            let period = false;

            while (src.length > 0) {
                if(src[0] == "." && !period) {
                    period = true;
                    num += src.shift()!;

                } else if (isInt(src[0])) {
                    num += src.shift()!;

                } else break;
            }

            // append new numeric token.
            tokens.push(token(num, TokenType.Number));
        } else {
            switch(char) {
                case "=":
                    src.shift()

                    if (src[0] == '=') {
                        src.shift()
                        tokens.push(token('==', TokenType.EqualsCompare));
                    } else {
                        tokens.push(token("=", TokenType.Equals));
                    }

                    break;
                case "&":
                    src.shift()

                    if (src[0] == '&') {
                        src.shift()
                        tokens.push(token('&&', TokenType.And));
                    } else {
                        tokens.push(token("&", TokenType.Ampersand));
                    }

                    break;
                case "!":
                    src.shift();
                    
                    if (String(src[0]) == '=') {
                        src.shift()
                        tokens.push(token("!=", TokenType.NotEqualsCompare));
                    } else {
                        tokens.push(token("!", TokenType.Exclamation));
                    }

                    break;

                case '"':
                case "'":
                    let str = "";
                    let raw = "";
        
                    src.shift();
                    let escaped = false;
        
                    while (src.length > 0) {
                        const key = src.shift();
                        raw += key;
        
                        if (key == "\\") {
                            escaped = !escaped;

                            if (escaped)
                                continue;
        
                        } else if (key == '"') {
                            if (!escaped) {
                                break;
                            }
        
                            escaped = false;
        
                        } else if (escaped) {
                            escaped = false;
        
                            if (ESCAPED[(key as string)]) {
                                str += ESCAPED[(key as string)];
                                continue;
                                    
                            } else {
                                str += `\\`;
                            }
                        }
                        str += key;
                    }
                    
                    tokens.push(token(str, TokenType.String, raw.substring(0, raw.length - 1)));
                    break;
                
                case "-":
                    if(src[1] == ">") {
                        src.shift();
                        src.shift();

                        tokens.push(token("->", TokenType.Ternary));
                        break;

                    } else if (src[1] != src[0]) {
                        const previdents = getPrevIdents(tokens);

                        if(previdents == null && tokens[tokens.length - 1].type != TokenType.CloseParen) {

                            tokens.push(token("0", TokenType.Number));
                            tokens.push(token(src.shift(), TokenType.BinaryOperator));
                            break;
                        }
                    }

                case "+":
                    if(src[1] == src[0]) {
                        const prevtokens = getPrevIdents(tokens);

                        if(prevtokens != null) {
                            tokens.push(token("=", TokenType.Equals));
                            prevtokens.forEach(token => tokens.push(token));

                            tokens.push(token(src.shift(), TokenType.BinaryOperator));
                            tokens.push(token("1", TokenType.Number));

                            src.shift();
                            break;
                        }
                    }
                
                case "*":
                case "/":
                    if (src[1] == "=") {
                        const prevtokens = getPrevIdents(tokens);
                        if(prevtokens == null) break;

                        tokens.push(token("=", TokenType.Equals));
                        prevtokens.forEach(token => tokens.push(token));

                        tokens.push(token(src.shift(), TokenType.BinaryOperator));
                        src.shift();
                        break;

                    } else if (src[0] == "/") {
                        if(src[1] == "*") {
                            let lastVal = "";
                            
                            while(src.length > 0) {
                                const nextVal = src.shift();

                                if(lastVal == "*" && nextVal == "/") {
                                    break;
                                }

                                lastVal = (nextVal as string);
                            }

                            break;
                        } else if (src[1] == "/") {
                            do {
                                src.shift();
                            } while (src.length > 0 && (src[0] as string) != "\n"); // fuck off typescript

                            src.shift();
                            break;
                        }
                    }

                default:
                    if (tokenType) {
                        tokens.push(token(src.shift(), tokenType))
                        
                    } else if (isAlpha(src[0])) {
                        let ident = "";

                        while (src.length > 0 && isAlpha(src[0])) {
                            ident += src.shift();
                        }
        
                        const reserved = KEYWORDS[ident];
        
                        if (typeof reserved == "number") {
                            tokens.push(token(ident, reserved))
                        } else {
                            tokens.push(token(ident, TokenType.Identifier))
                        }
                    } else if (isSkippable(src[0])) {
                        src.shift();

                    } else {
                        console.error("Unreconized character found in source:", src[0].charCodeAt(0), src[0]);
                        process.exit(1)
                    }
            }
        }
    }

    tokens.push(token("EndOfFile", TokenType.EOF));
    return tokens;
};