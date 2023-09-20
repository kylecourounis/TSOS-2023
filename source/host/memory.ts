/* ------------
CPU.ts

Routines for the host CPU simulation, NOT for the OS itself.
In this manner, it's A LITTLE BIT like a hypervisor,
in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
TypeScript/JavaScript in both the host and client environments.

This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */

module TSOS {

    export class Memory {
        private memory: Uint8Array;

        private mar: number = 0x0000;
        private mdr: number = 0x00;

        constructor() {

        }

        public init(): void {
            this.memory = new Uint8Array(0x300);

            for (let i = 0x0; i < this.memory.length; i++) {
                this.memory[i] = 0x00;
            }
        }

            
        /**
         * Gets the memory address register.
         * @returns the memory address register.
         */
        public getMAR() {
            return this.mar;
        }
    
        /**
         * Sets the memory address register.
         */
        public setMAR(mar: number) {
            this.mar = mar;
        }
    
        /**
         * Gets the memory data register.
         * @returns the memory data register.
         */
        public getMDR() {
            return this.mdr;
        }
    
        /**
         * Sets the memory data register.
         */
        public setMDR(mdr: number) {
            this.mdr = mdr;
        }
    
        /**
         * Read memory at the location in the MAR and update the MDR.
         */
        public read() {
            let value = this.memory[this.mar];
            this.setMDR(value);
        }
    
        /**
         * Write the contents of the MDR to memory at the location indicated by the MAR.
         */
        public write() {
            this.memory[this.mar] = this.mdr;
        }
    }
}
