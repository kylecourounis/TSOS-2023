/* ------------
   PCB.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class PCB {
        static pidStore = 0; // keep track of what PID we're up to
        pid;
        programCounter;
        instructionRegister;
        acc;
        xReg;
        yReg;
        constructor() {
            this.pid = PCB.pidStore;
            PCB.pidStore++;
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map