/* ------------
   PCB.ts
   ------------ */
module TSOS {
    export class PCB {
        public static pidStore: number = 0; // keep track of what PID we're up to

        public pid: number;

        public programCounter: number;

        public instructionRegister: number;

        public acc: number;

        public xReg: number;

        public yReg: number;

        constructor() {
            this.pid = PCB.pidStore;
            PCB.pidStore++;
        }
    }
}
