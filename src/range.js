function parse(code, options = {}) {
    var tokens = [];

    for (var i = 0; i < code.length; i++) {
        var currentChar = code.charAt(i);

        if (currentChar === '(') {
            tokens.push({
                type: 'openparen',
                value: currentChar,
            });

            continue;
        }

        if (currentChar === ')') {
            tokens.push({
                type: 'closeparen',
                value: currentChar,
            });

            continue;
        }

        if (currentChar === '[') {
            tokens.push({
                type: 'openbracket',
                value: currentChar,
            });

            continue;
        }

        if (currentChar === ']') {
            tokens.push({
                type: 'closebracket',
                value: currentChar,
            });

            continue;
        }

        if (/\,/.test(currentChar)) {
            tokens.push({
                type: 'comma',
                value: currentChar,
            });

            continue;
        }

        if (/[0-9]/.test(currentChar)) {
            var token = {
                type: 'number',
                value: currentChar,
            };
            tokens.push(token);

            for (i++; i < code.length; i++) {
                currentChar = code.charAt(i);

                if (/[0-9\.]/.test(currentChar)) {
                    token.value += currentChar;
                } else {
                    i--;
                    break;
                }
            }

            continue;
        }

        if (/\s/.test(currentChar)) {
            var token = {
                type: 'whitespace',
                value: currentChar,
            };

            if (options.whitespace) {
                tokens.push(token);
            }

            for (i++; i < code.length; i++) {
                currentChar = code.charAt(i);
                if (/\s/.test(currentChar)) {
                    token.value += currentChar;
                } else {
                    i--;
                    break;
                }
            }

            continue;
        }

        if ('&' === currentChar) {
            var token = {
                type: 'sep',
                value: currentChar,
            };

            tokens.push(token);
        }
    }

    return tokens;
}

function analysis(tokens) {
    var extremes = [],
        currentExtreme = {
            min: {},
            max: {},
        };

    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (token.type === 'openparen' || token.type === 'openbracket') {
            var nextToken = tokens[i + 1];
            currentExtreme.min = {
                include: token.type.indexOf('bracket') > -1,
            };

            if (nextToken.type === 'comma') {
                currentExtreme.min.value = -Infinity;
            } else {
                currentExtreme.min.value = nextToken.value;
            }
        }

        if (token.type === 'comma') {
            var nextToken = tokens[i + 1];
            currentExtreme.max = {};

            if (
                nextToken.type === 'closeparen' ||
                nextToken.type === 'closebracket'
            ) {
                currentExtreme.max.value = Infinity;
            } else if (nextToken.type === 'number') {
                var nextNextToken = tokens[i + 2];

                currentExtreme.max.value = nextToken.value;
                currentExtreme.max.include =
                    nextNextToken.type.indexOf('bracket') > -1;
            }
        }

        if (token.type.indexOf('close') > -1) {
            var nextToken = tokens[i + 1];
            if (!nextToken || nextToken.type === 'sep') {
                extremes.push(currentExtreme);

                currentExtreme = {
                    min: {},
                    max: {},
                };
            }
        }
    }

    extremes.forEach(function (extreme, i) {
        if (Number(extreme.min.value) >= Number(extreme.max.value)) {
            let str = '';
            str += extreme.min.include ? '[' : '(';
            str += extreme.min.value;
            str += ', ';
            str += extreme.max.value;
            str += extreme.max.include ? ']' : ')';

            throw new Error(`Range Error at ${i} for ${str}`);
        }
    });

    return extremes;
}

function check(value, congregate) {
    return congregate.reduce(function (prev, extreme) {
        var minRet = false,
            maxRet = false,
            min = extreme.min,
            max = extreme.max;

        if (min.include) {
            minRet = current || Number(min.value) <= value;
        } else {
            minRet = current || Number(min.value) < value;
        }

        if (max.include) {
            maxRet = current || Number(max.value) >= value;
        } else {
            maxRet = current || Number(max.value) > value;
        }

        var current = minRet && maxRet;

        prev = prev || current;
        return prev;
    }, false);
}

module.exports = function validate(value, range) {
    var tokens = parse(range);
    var congregate = analysis(tokens);
    var flag = check(value, congregate);

    return flag;
};
