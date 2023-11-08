/* ------------
   cpuDispatcher.ts
   ------------ */
module TSOS {
    export class CpuDispatcher {
        public doContextSwitch() {
            if (_PCBQueue.getSize() > 0) {
                let headProcess: PCB = _PCBQueue.dequeue();

                if (headProcess.state !== State.TERMINATED) {
                    headProcess.state = State.READY;
                    headProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                    Control.updatePCBRow(headProcess);

                    _PCBQueue.enqueue(headProcess);
    
                    _CurrentProcess = _PCBQueue.head(); // get head of process queue
                    _CurrentProcess.state = State.RUNNING;

                    console.log(_CurrentProcess);
    
                    Control.updatePCBRow(_CurrentProcess);
                    Control.updateCPUView();

                    _CPU.setState(_CurrentProcess.programCounter, _CurrentProcess.instructionRegister, _CurrentProcess.acc, _CurrentProcess.xReg, _CurrentProcess.yReg, _CurrentProcess.zFlag);
                } else {
                    _Kernel.krnTerminateProcess(headProcess);
                }

                if (_CPU.breakFlag) {
                    _Kernel.krnTerminateProcess(headProcess);
                }
            } else {
                _CPU.isExecuting = false;
                _CPU.init();
            }
        }
    }
}