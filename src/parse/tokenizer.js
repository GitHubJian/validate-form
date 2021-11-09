const charCodes = require('./charcodes');
const {types: tt} = require('./types');
const {isIdentifierStart} = require('./identifier');
const {isWhitespace} = require('./is-whitespace');

const forbiddenNumericSeparatorSiblings = {
    decBinOct: [
        charCodes.dot,
        charCodes.uppercaseB,
        charCodes.uppercaseE,
        charCodes.uppercaseO,
        charCodes.underscore, // multiple separators are not allowed
        charCodes.lowercaseB,
        charCodes.lowercaseE,
        charCodes.lowercaseO,
    ],
    hex: [
        charCodes.dot,
        charCodes.uppercaseX,
        charCodes.underscore, // multiple separators are not allowed
        charCodes.lowercaseX,
    ],
};

const allowedNumericSeparatorSiblings = {};
allowedNumericSeparatorSiblings.bin = [
    // 0 - 1
    charCodes.digit0,
    charCodes.digit1,
];
allowedNumericSeparatorSiblings.oct = [
    // 0 - 7
    ...allowedNumericSeparatorSiblings.bin,

    charCodes.digit2,
    charCodes.digit3,
    charCodes.digit4,
    charCodes.digit5,
    charCodes.digit6,
    charCodes.digit7,
];
allowedNumericSeparatorSiblings.dec = [
    // 0 - 9
    ...allowedNumericSeparatorSiblings.oct,

    charCodes.digit8,
    charCodes.digit9,
];

allowedNumericSeparatorSiblings.hex = [
    // 0 - 9, A - F, a - f,
    ...allowedNumericSeparatorSiblings.dec,

    charCodes.uppercaseA,
    charCodes.uppercaseB,
    charCodes.uppercaseC,
    charCodes.uppercaseD,
    charCodes.uppercaseE,
    charCodes.uppercaseF,

    charCodes.lowercaseA,
    charCodes.lowercaseB,
    charCodes.lowercaseC,
    charCodes.lowercaseD,
    charCodes.lowercaseE,
    charCodes.lowercaseF,
];

class State {
    constructor() {
        this.pos = 0;
    }
}

class Tokenizer {
    constructor(input) {
        this.input = input;
        this.state = new State();
        this.length = input.length;
    }

    next() {
        this.nextToken();
    }

    eat(type) {
        if (this.match(type)) {
            this.next();
            return true;
        } else {
            return false;
        }
    }

    match(type) {
        return this.state.type === type;
    }

    nextToken() {
        this.state.start = this.state.pos;

        this.skipSpace();

        if (this.state.pos >= this.length) {
            this.finishToken(tt.eof);
            return;
        }

        this.getTokenFromCode(this.codePointAtPos(this.state.pos));
    }

    codePointAtPos(pos) {
        let cp = this.input.charCodeAt(pos);
        if ((cp & 0xfc00) === 0xd800 && ++pos < this.input.length) {
            const trail = this.input.charCodeAt(pos);
            if ((trail & 0xfc00) === 0xdc00) {
                cp = 0x10000 + ((cp & 0x3ff) << 10) + (trail & 0x3ff);
            }
        }

        return cp;
    }

    getTokenFromCode(code) {
        switch (code) {
            case charCodes.leftParenthesis:
                ++this.state.pos;
                this.finishToken(tt.parenL);
                return;
            case charCodes.rightParenthesis:
                ++this.state.pos;
                this.finishToken(tt.parenR);
                return;
            case charCodes.leftSquareBracket:
                ++this.state.pos;
                this.finishToken(tt.bracketL);
                return;
            case charCodes.rightSquareBracket:
                ++this.state.pos;
                this.finishToken(tt.bracketR);
                return;
            case charCodes.comma:
                ++this.state.pos;
                this.finishToken(tt.comma);
                return;
            case charCodes.ampersand:
                ++this.state.pos;
                this.finishToken(tt.bitwiseAND);
                return;
            case charCodes.digit0:
                const next = this.input.charCodeAt(this.state.pos + 1);
                // '0x', '0X' - hex number
                if (
                    next === charCodes.lowercaseX ||
                    next === charCodes.uppercaseX
                ) {
                    this.readRadixNumber(16);
                    return;
                }
                // '0o', '0O' - octal number
                if (
                    next === charCodes.lowercaseO ||
                    next === charCodes.uppercaseO
                ) {
                    this.readRadixNumber(8);
                    return;
                }
                // '0b', '0B' - binary number
                if (
                    next === charCodes.lowercaseB ||
                    next === charCodes.uppercaseB
                ) {
                    this.readRadixNumber(2);
                    return;
                }
            case charCodes.digit1:
            case charCodes.digit2:
            case charCodes.digit3:
            case charCodes.digit4:
            case charCodes.digit5:
            case charCodes.digit6:
            case charCodes.digit7:
            case charCodes.digit8:
            case charCodes.digit9:
                this.readNumber(false);
                return;
        }
    }

    readRadixNumber(radix) {
        const start = this.state.pos;
        let isBigInt = false;

        this.state.pos += 2; // 0x
        const val = this.readInt(radix);
        if (val == null) {
            throw new Error('');
        }
        const next = this.input.charCodeAt(this.state.pos);

        if (next === charCodes.lowercaseN) {
            ++this.state.pos;
            isBigInt = true;
        } else if (next === charCodes.lowercaseM) {
            throw new Error('');
        }

        if (isIdentifierStart(this.codePointAtPos(this.state.pos))) {
            throw new Error();
        }

        if (isBigInt) {
            const str = this.input
                .slice(start, this.state.pos)
                .replace(/[_n]/g, '');
            this.finishToken(tt.bigint, str);
            return;
        }

        this.finishToken(tt.num, val);
    }

    readInt(radix, len, forceLen, allowNumSeparator) {
        const start = this.state.pos;
        const forbiddenSiblings =
            radix === 16
                ? forbiddenNumericSeparatorSiblings.hex
                : forbiddenNumericSeparatorSiblings.decBinOct;
        const allowedSiblings =
            radix === 16
                ? allowedNumericSeparatorSiblings.hex
                : radix === 10
                ? allowedNumericSeparatorSiblings.dec
                : radix === 8
                ? allowedNumericSeparatorSiblings.oct
                : allowedNumericSeparatorSiblings.bin;

        let invalid = false;
        let total = 0;
        for (let i = 0, e = len == null ? Infinity : len; i < e; ++i) {
            const code = this.input.charCodeAt(this.state.pos);
            let val;

            if (code === charCodes.underscore) {
                const prev = this.input.charCodeAt(this.state.pos - 1);
                const next = this.input.charCodeAt(this.state.pos + 1);
                if (allowedSiblings.indexOf(next) === -1) {
                    throw new Error('');
                } else if (
                    forbiddenSiblings.indexOf(prev) > -1 ||
                    forbiddenSiblings.indexOf(next) > -1 ||
                    Number.isNaN(next)
                ) {
                    throw new Error();
                }

                if (!allowNumSeparator) {
                    throw new Error();
                }

                // Ignore this _ character
                ++this.state.pos;
                continue;
            }

            if (code >= charCodes.lowercaseA) {
                val = code - charCodes.lowercaseA + charCodes.lineFeed;
            } else if (code >= charCodes.uppercaseA) {
                val = code - charCodes.uppercaseA + charCodes.lineFeed;
            } else if (charCodes.isDigit(code)) {
                val = code - charCodes.digit0; // 0-9
            } else {
                val = Infinity;
            }

            if (val >= radix) {
                if (forceLen) {
                    val = 0;
                    invalid = true;
                } else {
                    break;
                }
            }

            ++this.state.pos;
            total = total * radix + val;
        }

        if (
            this.state.pos === start ||
            (len != null && this.state.pos - start !== len) ||
            invalid
        ) {
            return null;
        }

        return total;
    }

    readNumber(startsWithDot) {
        const start = this.state.pos;
        let isFloat = false;
        let isBigInt = false;
        let isDecimal = false;
        let hasExponent = false;
        let isOctal = false;

        if (!startsWithDot && this.readInt(10) === null) {
            // this.raise(start, Errors.InvalidNumber);
        }
        const hasLeadingZero =
            this.state.pos - start >= 2 &&
            this.input.charCodeAt(start) === charCodes.digit0;

        if (hasLeadingZero) {
            const integer = this.input.slice(start, this.state.pos);
            // this.recordStrictModeErrors(start, Errors.StrictOctalLiteral);
            if (!this.state.strict) {
                // disallow numeric separators in non octal decimals and legacy octal likes
                const underscorePos = integer.indexOf('_');
                if (underscorePos > 0) {
                    // this.raise(
                    //     underscorePos + start,
                    //     Errors.ZeroDigitNumericSeparator
                    // );
                }
            }
            isOctal = hasLeadingZero && !/[89]/.test(integer);
        }

        let next = this.input.charCodeAt(this.state.pos);
        if (next === charCodes.dot && !isOctal) {
            ++this.state.pos;
            this.readInt(10);
            isFloat = true;
            next = this.input.charCodeAt(this.state.pos);
        }

        if (
            (next === charCodes.uppercaseE || next === charCodes.lowercaseE) &&
            !isOctal
        ) {
            next = this.input.charCodeAt(++this.state.pos);
            if (next === charCodes.plusSign || next === charCodes.dash) {
                ++this.state.pos;
            }
            if (this.readInt(10) === null) {
                // this.raise(start, Errors.InvalidOrMissingExponent);
            }
            isFloat = true;
            hasExponent = true;
            next = this.input.charCodeAt(this.state.pos);
        }

        if (next === charCodes.lowercaseN) {
            // disallow floats, legacy octal syntax and non octal decimals
            // new style octal ("0o") is handled in this.readRadixNumber
            if (isFloat || hasLeadingZero) {
                // this.raise(start, Errors.InvalidBigIntLiteral);
            }
            ++this.state.pos;
            isBigInt = true;
        }

        if (next === charCodes.lowercaseM) {
            // this.expectPlugin('decimal', this.state.pos);
            if (hasExponent || hasLeadingZero) {
                // this.raise(start, Errors.InvalidDecimal);
            }
            ++this.state.pos;
            isDecimal = true;
        }

        if (isIdentifierStart(this.codePointAtPos(this.state.pos))) {
            // throw this.raise(this.state.pos, Errors.NumberIdentifier);
        }

        // remove "_" for numeric literal separator, and trailing `m` or `n`
        const str = this.input
            .slice(start, this.state.pos)
            .replace(/[_mn]/g, '');

        if (isBigInt) {
            this.finishToken(tt.bigint, str);
            return;
        }

        if (isDecimal) {
            this.finishToken(tt.decimal, str);
            return;
        }

        const val = isOctal ? parseInt(str, 8) : parseFloat(str);
        this.finishToken(tt.num, val);
    }

    finishToken(type, val) {
        this.state.end = this.state.pos;

        this.state.type = type;
        this.state.value = val;
    }

    skipBlockComment() {
        const start = this.state.pos;
        const end = this.input.indexOf('*/', start + 2);
        this.state.pos = end + 2;
    }

    skipLineComment(startSkip) {
        let ch = this.input.charCodeAt((this.state.pos += startSkip));
        if (this.state.pos < this.length) {
            while (!isNewLine(ch) && ++this.state.pos < this.length) {
                ch = this.input.charCodeAt(this.state.pos);
            }
        }
    }

    skipSpace() {
        loop: while (this.state.pos < this.length) {
            const ch = this.input.charCodeAt(this.state.pos);
            switch (ch) {
                case charCodes.space:
                case charCodes.nonBreakingSpace:
                case charCodes.tab:
                    ++this.state.pos;
                    break;
                case charCodes.carriageReturn:
                    if (
                        this.input.charCodeAt(this.state.pos + 1) ===
                        charCodes.lineFeed
                    ) {
                        ++this.state.pos;
                    }
                case charCodes.lineFeed:
                case charCodes.lineSeparator:
                case charCodes.paragraphSeparator:
                    ++this.state.pos;
                    ++this.state.curLine;
                    this.state.lineStart = this.state.pos;
                    break;
                case charCodes.slash:
                    switch (this.input.charCodeAt(this.state.pos + 1)) {
                        case charCodes.asterisk: {
                            const comment = this.skipBlockComment();
                            if (comment !== undefined) {
                                this.addComment(comment);
                                if (this.options.attachComment)
                                    comments.push(comment);
                            }
                            break;
                        }

                        case charCodes.slash: {
                            const comment = this.skipLineComment(2);
                            if (comment !== undefined) {
                                this.addComment(comment);
                                if (this.options.attachComment)
                                    comments.push(comment);
                            }
                            break;
                        }

                        default:
                            break loop;
                    }
                    break;
                default:
                    if (isWhitespace(ch)) {
                        ++this.state.pos;
                    } else {
                        break loop;
                    }
            }
        }
    }
}

module.exports = Tokenizer;
