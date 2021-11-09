class TokenType {
    constructor(label) {
        this.label = label;
    }
}

const keywords = new Map();
function createKeyword(name) {
    const token = new TokenType(name);
    keywords.set(name, token);

    return token;
}

const types = {
    num: new TokenType('num'),
    bigint: new TokenType('bigint'),
    eof: new TokenType('eof'),

    bracketL: new TokenType('['),
    bracketR: new TokenType(']'),
    parenL: new TokenType('('),
    parenR: new TokenType(')'),
    comma: new TokenType(','),
    dot: new TokenType('.'),

    bitwiseAND: new TokenType('&'),
};
exports.types = types;
