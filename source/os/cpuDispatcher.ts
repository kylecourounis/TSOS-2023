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

                let newProcess = _CurrentProcess;

                if (newProcess.location === Location.DISK_DRIVE) {
                    _Swap.swap(newProcess);
                }
                
                newProcess.state = State.RUNNING;

                console.log(`${newProcess.pid} (${newProcess.segment}): ${newProcess.base}-${newProcess.limit}`);
                console.log(_MemAccessor.getRange(newProcess.base, newProcess.limit));
                console.log("\n");
    
                Control.updatePCBRow(newProcess);
                Control.updateCPUView();

                _CPU.setState(newProcess.programCounter, newProcess.instructionRegister, newProcess.acc, newProcess.xReg, newProcess.yReg, newProcess.zFlag);

                _CurrentProcess = newProcess;
            } else {
                _CPU.isExecuting = false;
                _CPU.init();
            }
        }
    }
}