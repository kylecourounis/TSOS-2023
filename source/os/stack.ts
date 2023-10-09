module TSOS {
    // Basic stack implementation - nothing crazy
    export class Stack {
        private items: any[];
    
        constructor() {
            this.items = [];
        }
      
        public push(item: any): void {
            this.items.push(item);
        }
      
        public pop(): any {
            return this.items.pop();
        }
      
        public peek(): any {
            return this.items[this.items.length - 1];
        }
      
        public isEmpty(): boolean {
            return this.items.length === 0;
        }
      
        public size(): number {
            return this.items.length;
        }
    }
}