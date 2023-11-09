/* ------------
   cpuDispatcher.ts
   ------------ */
module TSOS {
    export class CpuDispatcher {
        public doContextSwitch() {
            if (_PCBQueue.getSize() > 0) {
                let runningProcess = _CurrentProcess;
                
                if (runningProcess) {
                    _CurrentProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                    _CPU.init();

                    _CurrentProcess.state = State.READY;
                    Control.updatePCBRow(_CurrentProcess);

                    _PCBQueue.enqueue(_CurrentProcess);
                }

                _CurrentProcess = _PCBQueue.dequeue();
                _CurrentProcess.state = State.RUNNING;
    
                Control.updatePCBRow(_CurrentProcess);
                Control.updateCPUView();

                _CPU.setState(_CurrentProcess.programCounter, _CurrentProcess.instructionRegister, _CurrentProcess.acc, _CurrentProcess.xReg, _CurrentProcess.yReg, _CurrentProcess.zFlag);
            } else {
                _CPU.isExecuting = false;
                _CPU.init();
            }
        }
    }
}