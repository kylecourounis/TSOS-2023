/* ------------
   cpuDispatcher.ts
   ------------ */
module TSOS {
    export class CpuDispatcher {
        constructor(public runningProcess: PCB = null) {
        }

        public doContextSwitch() {
            if (_PCBQueue.getSize() > 0) {
                let headProcess: PCB = _PCBQueue.dequeue();
                
                console.log(headProcess);
    
                if (headProcess.state !== State.TERMINATED) {
                    _CPU.isExecuting = false;
                    
                    headProcess.state = State.READY;
                    headProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);

                    Control.updatePCBRow(headProcess);

                    _PCBQueue.enqueue(headProcess);

                    _CurrentProcess = _PCBQueue.head(); // get head of process queue
    
                    Control.updatePCBRow(_CurrentProcess);
                    
                    Control.updateCPUView();
                } else {
                    let terminated = _PCBQueue.dequeue();
                    
                    _MemoryManager.deallocateMemory(headProcess);
                }
            } else {
                _CPU.isExecuting = false;
                _CPU.init();
            }

            if (_CurrentProcess != null) {
                _CPU.isExecuting = true;
                _CPU.setState(_CurrentProcess.programCounter, _CurrentProcess.instructionRegister, _CurrentProcess.acc, _CurrentProcess.xReg, _CurrentProcess.yReg, _CurrentProcess.zFlag);
                _CurrentProcess.state = State.RUNNING;
                this.runningProcess = _CurrentProcess;
            }
        }
    }
}