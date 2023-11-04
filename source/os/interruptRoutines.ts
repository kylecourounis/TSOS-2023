/* ------------
   InterruptRoutines.ts
------------ */
module TSOS {
    export class InterruptRoutines {
        public static step() {
            // Increment the hardware (host) clock.
            _OSclock++;
            
            _CPU.cycle();

            _PCBQueue.head().updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);

            Control.updatePCBRow(_PCBQueue.head());

            Control.updateMemoryView();
            Control.updateCPUView();
        }

        public static triggerContextSwitch() {
            _CpuDispatcher.doContextSwitch();
        }
    }
}
