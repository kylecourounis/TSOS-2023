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
            this.state = State.RESIDENT;
        }
    }
    TSOS.PCB = PCB;
    let State;
    (function (State) {
        State[State["RESIDENT"] = 0] = "RESIDENT";
        State[State["NEW"] = 1] = "NEW";
        State[State["RUNNING"] = 2] = "RUNNING";
        State[State["WAITING"] = 3] = "WAITING";
        State[State["READY"] = 4] = "READY";
        State[State["TERMINATED"] = 5] = "TERMINATED";
    })(State = TSOS.State || (TSOS.State = {}));
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map