const StatementParser = require('./statement');

class Parser extends StatementParser {
    parse() {
        const file = this.startNode();
        const program = this.startNode();
        this.nextToken();
        this.parseTopLevel(file, program);
        debugger;
        return file;
    }
}

module.exports = Parser;
