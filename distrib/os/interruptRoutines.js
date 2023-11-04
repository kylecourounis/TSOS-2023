/* ------------
   InterruptRoutines.ts
------------ */
var TSOS;
(function (TSOS) {
    class InterruptRoutines {
        static step() {
            // Increment the hardware (host) clock.
            _OSclock++;
            _CPU.cycle();
            _PCBQueue.head().updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
            TSOS.Control.updatePCBRow(_PCBQueue.head());
            TSOS.Control.updateMemoryView();
            TSOS.Control.updateCPUView();
        }
        static triggerContextSwitch() {
            _CpuDispatcher.doContextSwitch();
        }
    }
    TSOS.InterruptRoutines = InterruptRoutines;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=interruptRoutines.js.map