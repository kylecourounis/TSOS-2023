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

        public base: number;

        public limit: number;

        public segment: number;

        public location: Location;

        constructor() {
            this.pid = PCB.pidStore;
            PCB.pidStore++;

            this.programCounter = 0;
            this.instructionRegister = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.location = Location.MEMORY;

            this.state = State.NEW;
        }

        public updateFromCPU(pc: number, ir: number, acc: number, xReg: number, yReg: number, zFlag: number): void {
            this.programCounter = pc;
            this.instructionRegister = ir;
            this.acc = acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
        }
    }

    export enum State {
        RESIDENT = 'Resident',
        NEW = 'New',
        RUNNING = 'Running',
        WAITING = 'Waiting',
        READY = 'Ready',
        TERMINATED = 'Terminated'
    }

    export enum Location {
        MEMORY = 'Memory',
        DISK_DRIVE = 'Disk Drive' // For Project 4
    }
}
