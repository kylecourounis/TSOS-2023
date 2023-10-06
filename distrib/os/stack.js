var TSOS;
(function (TSOS) {
    // Basic stack implementation - nothing crazy
    class Stack {
        items;
        constructor() {
            this.items = [];
        }
        push(item) {
            this.items.push(item);
        }
        pop() {
            return this.items.pop();
        }
        peek() {
            return this.items[this.items.length - 1];
        }
        isEmpty() {
            return this.items.length === 0;
        }
        size() {
            return this.items.length;
        }
    }
    TSOS.Stack = Stack;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=stack.js.map