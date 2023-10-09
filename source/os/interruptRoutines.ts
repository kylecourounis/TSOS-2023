/* ------------
   InterruptRoutines.ts
------------ */
module TSOS {
    export class InterruptRoutines {
        public static step() {
            // Increment the hardware (host) clock.
            _OSclock++;
            
            _CPU.cycle();

             _Kernel.currentRunningProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);

            Control.updatePCBRow(_Kernel.currentRunningProcess);

            Control.updateMemoryView();
            Control.updateCPUView();
        }
    }
}
