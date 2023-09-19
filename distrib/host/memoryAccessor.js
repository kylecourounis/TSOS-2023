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
    class MemoryAccessor {
        memory;
        decodedByte1 = null;
        decodedByte2 = null;
        /**
         * Initializes a new instance of the MMU class.
         * @param memory Instance of Memory
         */
        constructor(memory) {
            this.memory = memory;
        }
        /**
         * Returns the value of the MAR.
         * @returns The MAR
         */
        getMAR() {
            return this.memory.getMAR();
        }
        /**
         * Returns the value of the MDR.
         * @returns The MDR
         */
        getMDR() {
            return this.memory.getMDR();
        }
        /**
         * Sets the memory address register.
         * @param address The memory address to put in the MAR.
         */
        setMAR(address) {
            this.memory.setMAR(address);
        }
        /**
         * Sets the memory data register.
         * @param address The value to put in the MDR.
         */
        setMDR(value) {
            this.memory.setMDR(value);
        }
        /**
         * Read from memory using the program counter.
         */
        read() {
            this.memory.read();
            return this.memory.getMDR();
        }
        /**
         * Write to memory.
         */
        write(value) {
            this.memory.setMDR(value);
            this.memory.write();
        }
        /**
         * Sets the MAR and reads the value from memory at that location.
         * @param address The address at which to read the MDR from.
         */
        readImmediate(address) {
            this.memory.setMAR(address);
            this.memory.read();
        }
        /**
         * Sets the MAR and MDR to the specified values and forcibly writes to memory.
         * @param address The address where we are setting the value.
         * @param value The value to place in the MDR.
         */
        writeImmediate(address, value) {
            this.memory.setMAR(address);
            this.memory.setMDR(value);
            this.memory.write();
        }
        /**
         * Sets the LOB of the MAR.
         * @param lob Low order byte
         */
        setLowOrderByte(lob) {
            this.memory.setMAR(lob);
        }
        /**
         * Sets the HOB of the MAR.
         * @param hob High order byte
         */
        setHighOrderByte(hob) {
            let lob = MemoryAccessor.flipEndianess(this.decodedByte1);
            let val = MemoryAccessor.flipEndianess(lob | hob);
            this.memory.setMAR(val);
        }
        /**
         * Static helper method that utilizes bitwise operators to flip endianess.
         * @param value The integer we are flipping
         * @returns The flipped integer
         */
        static flipEndianess(value) {
            // Get LSB by ANDing with 0xFF, shift 8 bits left, shift the rest 8 bits right and AND with 0xFF, and an OR to combine the values
            // What's nice about this solution is it is reversible, so you can flip the endianess both ways using this same function
            // For instance, calling this on 0x4A15 will convert it to 0x154A, and vice-versa.
            return ((value & 0xFF) << 8) | ((value >> 8) & 0xFF);
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map