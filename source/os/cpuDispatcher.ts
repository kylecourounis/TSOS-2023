/* ------------
   cpuDispatcher.ts
   ------------ */
module TSOS {
    export class CpuDispatcher {
        constructor() {
        }

        public doContextSwitch() {
            if (_PCBQueue.getSize() > 0) {
                console.log(_PCBQueue);

                let headProcess: PCB = _PCBQueue.dequeue();
    
                if (headProcess.state !== State.TERMINATED) {
                    headProcess.state = State.READY;
                    headProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);

                    Control.updatePCBRow(headProcess);

                    _PCBQueue.enqueue(headProcess);

                    let process: PCB = _PCBQueue.head(); // get head of process queue
    
                    _CPU.setState(process.programCounter, process.instructionRegister, process.acc, process.xReg, process.yReg, process.zFlag);
                    process.state = State.RUNNING;
    
                    Control.updatePCBRow(process);
                    
                    Control.updateCPUView();
                } else {
                    let terminated = _PCBQueue.dequeue();
                    
                    _MemoryManager.deallocateMemory(headProcess);
                }
            } else {
                _CPU.isExecuting = false;
                _CPU.init();
            }
        }
    }
}