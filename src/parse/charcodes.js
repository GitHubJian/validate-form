exports.backSpace = 8;
exports.tab = 9; //  '\t'
exports.lineFeed = 10; //  '\n'
exports.carriageReturn = 13; //  '\r'
exports.shiftOut = 14;
exports.space = 32;
exports.exclamationMark = 33; //  '!'
exports.quotationMark = 34; //  '"'
exports.numberSign = 35; //  '#'
exports.dollarSign = 36; //  '$'
exports.percentSign = 37; //  '%'
exports.ampersand = 38; //  '&'
exports.apostrophe = 39; //  '''
exports.leftParenthesis = 40; //  '('
exports.rightParenthesis = 41; //  ')'
exports.asterisk = 42; //  '*'
exports.plusSign = 43; //  '+'
exports.comma = 44; //  ','
exports.dash = 45; //  '-'
exports.dot = 46; //  '.'
exports.slash = 47; //  '/'
exports.digit0 = 48; //  '0'
exports.digit1 = 49; //  '1'
exports.digit2 = 50; //  '2'
exports.digit3 = 51; //  '3'
exports.digit4 = 52; //  '4'
exports.digit5 = 53; //  '5'
exports.digit6 = 54; //  '6'
exports.digit7 = 55; //  '7'
exports.digit8 = 56; //  '8'
exports.digit9 = 57; //  '9'
exports.colon = 58; //  ':'
exports.semicolon = 59; //  ';'
exports.lessThan = 60; //  '<'
exports.equalsTo = 61; //  '='
exports.greaterThan = 62; //  '>'
exports.questionMark = 63; //  '?'
exports.atSign = 64; //  '@'
exports.uppercaseA = 65; //  'A'
exports.uppercaseB = 66; //  'B'
exports.uppercaseC = 67; //  'C'
exports.uppercaseD = 68; //  'D'
exports.uppercaseE = 69; //  'E'
exports.uppercaseF = 70; //  'F'
exports.uppercaseG = 71; //  'G'
exports.uppercaseH = 72; //  'H'
exports.uppercaseI = 73; //  'I'
exports.uppercaseJ = 74; //  'J'
exports.uppercaseK = 75; //  'K'
exports.uppercaseL = 76; //  'L'
exports.uppercaseM = 77; //  'M'
exports.uppercaseN = 78; //  'N'
exports.uppercaseO = 79; //  'O'
exports.uppercaseP = 80; //  'P'
exports.uppercaseQ = 81; //  'Q'
exports.uppercaseR = 82; //  'R'
exports.uppercaseS = 83; //  'S'
exports.uppercaseT = 84; //  'T'
exports.uppercaseU = 85; //  'U'
exports.uppercaseV = 86; //  'V'
exports.uppercaseW = 87; //  'W'
exports.uppercaseX = 88; //  'X'
exports.uppercaseY = 89; //  'Y'
exports.uppercaseZ = 90; //  'Z'
exports.leftSquareBracket = 91; //  '['
exports.backslash = 92; //  '\    '
exports.rightSquareBracket = 93; //  ']'
exports.caret = 94; //  '^'
exports.underscore = 95; //  '_'
exports.graveAccent = 96; //  '`'
exports.lowercaseA = 97; //  'a'
exports.lowercaseB = 98; //  'b'
exports.lowercaseC = 99; //  'c'
exports.lowercaseD = 100; //  'd'
exports.lowercaseE = 101; //  'e'
exports.lowercaseF = 102; //  'f'
exports.lowercaseG = 103; //  'g'
exports.lowercaseH = 104; //  'h'
exports.lowercaseI = 105; //  'i'
exports.lowercaseJ = 106; //  'j'
exports.lowercaseK = 107; //  'k'
exports.lowercaseL = 108; //  'l'
exports.lowercaseM = 109; //  'm'
exports.lowercaseN = 110; //  'n'
exports.lowercaseO = 111; //  'o'
exports.lowercaseP = 112; //  'p'
exports.lowercaseQ = 113; //  'q'
exports.lowercaseR = 114; //  'r'
exports.lowercaseS = 115; //  's'
exports.lowercaseT = 116; //  't'
exports.lowercaseU = 117; //  'u'
exports.lowercaseV = 118; //  'v'
exports.lowercaseW = 119; //  'w'
exports.lowercaseX = 120; //  'x'
exports.lowercaseY = 121; //  'y'
exports.lowercaseZ = 122; //  'z'
exports.leftCurlyBrace = 123; //  '{'
exports.verticalBar = 124; //  '|'
exports.rightCurlyBrace = 125; //  '}'
exports.tilde = 126; //  '~'
exports.nonBreakingSpace = 160;
exports.oghamSpaceMark = 5760; // ' '
exports.lineSeparator = 8232;
exports.paragraphSeparator = 8233;

exports.isDigit = function isDigit(code) {
    return code >= exports.digit0 && code <= exports.digit9;
};
