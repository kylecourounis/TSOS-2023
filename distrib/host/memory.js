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
var TSOS;
(function (TSOS) {
    class Memory {
        static SIZE = 0x300;
        memory;
        mar = 0x0000;
        mdr = 0x00;
        constructor() {
        }
        init() {
            this.memory = new Uint8Array(Memory.SIZE);
            for (let i = 0x0; i < this.memory.length; i++) {
                this.memory[i] = 0x00;
            }
        }
        /**
         * Gets the length of the memory array.
         * @returns The length of the memory array.
         */
        getLength() {
            return this.memory.length;
        }
        /**
         * Gets the memory address register.
         * @returns the memory address register.
         */
        getMAR() {
            return this.mar;
        }
        /**
         * Sets the memory address register.
         */
        setMAR(mar) {
            this.mar = mar;
        }
        /**
         * Gets the memory data register.
         * @returns the memory data register.
         */
        getMDR() {
            return this.mdr;
        }
        /**
         * Sets the memory data register.
         */
        setMDR(mdr) {
            this.mdr = mdr;
        }
        /**
         * Read memory at the location in the MAR and update the MDR.
         */
        read() {
            let value = this.memory[this.mar];
            this.setMDR(value);
        }
        /**
         * Write the contents of the MDR to memory at the location indicated by the MAR.
         */
        write() {
            this.memory[this.mar] = this.mdr;
        }
        /**
         * Clears memory with a specific length.
         */
        clearMemory(segmentLength) {
            for (let i = 0x0; i < segmentLength; i++) {
                this.memory[i] = 0x00;
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map