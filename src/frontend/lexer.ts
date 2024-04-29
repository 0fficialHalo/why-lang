export enum TokenType {
	// Literal Types
	Number,
    String,
	Identifier,

	// Keywords
	Let,
    Const,
    Func,
    Return,
    Not,

	// Grouping * Operators
	BinaryOperator,
	Equals,
    Comma, 
    Dot,
    Colon,
    Semicolon,
	OpenParen, // (
	CloseParen, // )
    OpenBrace, // {
    CloseBrace, // }
    OpenBracket, // [
    CloseBracket, // ]

    // Marks the end of file
    EOF,
}

const KEYWORDS: Record<string, TokenType> = {
    let: TokenType.Let,
    const: TokenType.Const,
    func: TokenType.Func,
    return: TokenType.Return,
    not: TokenType.Not,
};

export interface Token {
    value: string;
    type: TokenType;
};

function token(value = "", type: TokenType): Token {
    return { value, type };
};

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

export function tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("")

    while (src.length > 0) {
        const doubleSrc = String(src[0]) + String(src[1])

        if (src[0] == "(") {
            tokens.push(token(src.shift(), TokenType.OpenParen))

        } else if (src[0] == ")") {
            tokens.push(token(src.shift(), TokenType.CloseParen))

        } else if (src[0] == "{") {
            tokens.push(token(src.shift(), TokenType.OpenBrace))

        } else if (src[0] == "}") {
            tokens.push(token(src.shift(), TokenType.CloseBrace))

        } else if (src[0] == "[") {
            tokens.push(token(src.shift(), TokenType.OpenBracket))

        } else if (src[0] == "]") {
            tokens.push(token(src.shift(), TokenType.CloseBracket))

        } else if (doubleSrc == "==" || doubleSrc == ">=" || doubleSrc == "<=" || doubleSrc == "!=") {
            tokens.push(token(doubleSrc, TokenType.BinaryOperator));
            src.shift(); src.shift();

        } else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%" || src[0] == ">" || src[0] == "<") {
            tokens.push(token(src.shift(), TokenType.BinaryOperator))

        }  else if (src[0] == "=") {
            tokens.push(token(src.shift(), TokenType.Equals))

        } else if (src[0] == ";") {
            tokens.push(token(src.shift(), TokenType.Semicolon))

        } else if (src[0] == ":") {
            tokens.push(token(src.shift(), TokenType.Colon))

        } else if (src[0] == ",") {
            tokens.push(token(src.shift(), TokenType.Comma))

        } else if (src[0] == ".") {
            tokens.push(token(src.shift(), TokenType.Dot))

        } else if (src[0] == '"' || src[0] == "'") {
            src.shift();
            let str: string = "";

            while (src[0] != '"' && src[0] != "'") {
                str += src[0];
                src.shift();
            }

            src.shift();
            tokens.push(token(str, TokenType.String))
            
        } else {
            if (isInt(src[0])) {
                let num = ""
                while (src.length > 0 && isInt(src[0])) {
                    num += src.shift();
                }
                
                tokens.push(token(num, TokenType.Number));
            } 
            else if (isAlpha(src[0])) {
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

    tokens.push({ value: "EndOfFile", type: TokenType.EOF });
    return tokens;
};