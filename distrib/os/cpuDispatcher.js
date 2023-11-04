/* ------------
   cpuDispatcher.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class CpuDispatcher {
        constructor() {
        }
        doContextSwitch() {
            if (_PCBQueue.getSize() > 0) {
                console.log(_PCBQueue);
                let headProcess = _PCBQueue.dequeue();
                if (headProcess.state !== TSOS.State.TERMINATED) {
                    headProcess.state = TSOS.State.READY;
                    headProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                    TSOS.Control.updatePCBRow(headProcess);
                    _PCBQueue.enqueue(headProcess);
                    let process = _PCBQueue.head(); // get head of process queue
                    _CPU.setState(process.programCounter, process.instructionRegister, process.acc, process.xReg, process.yReg, process.zFlag);
                    process.state = TSOS.State.RUNNING;
                    TSOS.Control.updatePCBRow(process);
                    TSOS.Control.updateCPUView();
                }
                else {
                    let terminated = _PCBQueue.dequeue();
                    _MemoryManager.deallocateMemory(headProcess);
                }
            }
            else {
                _CPU.isExecuting = false;
                _CPU.init();
            }
        }
    }
    TSOS.CpuDispatcher = CpuDispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuDispatcher.js.map