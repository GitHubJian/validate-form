const Tokenizer = require('./tokenizer');

class Node {}

class NodeUtil extends Tokenizer {
    startNode() {
        return new Node();
    }

    finishNode(node, type) {
        return this.finishNodeAt(node, type, this.state.lastTokEnd);
    }

    finishNodeAt(node, type, pos) {
        node.type = type;
        node.end = pos;

        return node;
    }
}

module.exports = NodeUtil;
