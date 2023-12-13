/* ------------
   PCB.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class PCB {
        static pidStore = 0; // keep track of what PID we're up to
        state;
        pid;
        programCounter;
        instructionRegister;
        acc;
        xReg;
        yReg;
        zFlag;
        base;
        limit;
        segment;
        location;
        swapFile;
        constructor() {
            this.pid = PCB.pidStore;
            this.programCounter = 0;
            this.instructionRegister = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.segment = 0;
            this.location = Location.MEMORY;
            this.state = State.NEW;
            this.swapFile = `${this.pid}.swap`;
        }
        updateFromCPU(pc, ir, acc, xReg, yReg, zFlag) {
            this.programCounter = pc;
            this.instructionRegister = ir;
            this.acc = acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
        }
    }
    TSOS.PCB = PCB;
    let State;
    (function (State) {
        State["RESIDENT"] = "Resident";
        State["NEW"] = "New";
        State["RUNNING"] = "Running";
        State["WAITING"] = "Waiting";
        State["READY"] = "Ready";
        State["TERMINATED"] = "Terminated";
    })(State = TSOS.State || (TSOS.State = {}));
    let Location;
    (function (Location) {
        Location["MEMORY"] = "Memory";
        Location["DISK_DRIVE"] = "Disk Drive"; // For Project 4
    })(Location = TSOS.Location || (TSOS.Location = {}));
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map