const {types: tt} = require('./types');
const Node = require('./node');

class StatementParser extends Node {
    parseTopLevel(file, program) {
        file.program = this.parseProgram(program);

        return this.finishNode(file, 'File');
    }

    parseProgram(program, end = tt.eof) {
        this.parseBlockBody(program, true, end);

        return this.finishNode(program, 'Program');
    }

    parseBlockBody(node, topLevel, end) {
        const body = (node.body = []);
        this.parseStatement(body, end);
    }

    parseStatement(body, end) {
        do {
            const node = this.parseStatementContent();

            body.push(node);
        } while (this.eat(tt.bitwiseAND) && !this.match(end));
    }

    parseStatementContent() {
        const node = this.startNode();
        node.minInclude = this.state.type === tt.bracketL;
        this.next();

        if (this.match(tt.comma)) {
            node.min = -Infinity;

            this.next();
            node.max = this.state.value;
            this.next();
            node.maxInclude = this.state.type === tt.bracketR;
        } else {
            node.min = this.state.value;
            this.next();

            if (this.eat(tt.comma)) {
                if (this.state.type !== tt.num) {
                    node.max = Infinity;
                    node.maxInclude = this.state.type === tt.bracketR;
                } else {
                    node.max = this.state.value;
                    this.next();
                    node.maxInclude = this.state.type === tt.bracketR;
                }
            } else {
                node.max = Infinity;
                node.maxInclude = this.state.type === tt.bracketR;
            }
        }

        this.next();
        this.finishNode(node, 'AA');

        return node;
    }
}

module.exports = StatementParser;
