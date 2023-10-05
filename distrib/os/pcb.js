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
        constructor() {
            this.pid = PCB.pidStore;
            PCB.pidStore++;
            this.programCounter = 0;
            this.instructionRegister = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.state = State.NEW;
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
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map