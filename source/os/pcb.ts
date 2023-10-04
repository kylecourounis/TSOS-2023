/* ------------
   PCB.ts
   ------------ */
module TSOS {
    export class PCB {
        public static pidStore: number = 0; // keep track of what PID we're up to

        public state: State;

        public pid: number;

        public programCounter: number;

        public instructionRegister: number;

        public acc: number;

        public xReg: number;

        public yReg: number;

        public zFlag: number;

        constructor() {
            this.pid = PCB.pidStore;
            PCB.pidStore++;

            this.programCounter = 0;
            this.instructionRegister = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;

            this.state = State.RESIDENT;
        }
    }

    export enum State {
        RESIDENT,
        NEW,
        RUNNING,
        WAITING,
        READY,
        TERMINATED
    }
}
