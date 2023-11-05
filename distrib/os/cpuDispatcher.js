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
                let headProcess = _PCBQueue.dequeue();
                console.log(headProcess);
                if (headProcess.state !== TSOS.State.TERMINATED) {
                    headProcess.state = TSOS.State.READY;
                    headProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                    TSOS.Control.updatePCBRow(headProcess);
                    _PCBQueue.enqueue(headProcess);
                    _CurrentProcess = _PCBQueue.head(); // get head of process queue
                    _CurrentProcess.state = TSOS.State.RUNNING;
                    TSOS.Control.updatePCBRow(_CurrentProcess);
                    TSOS.Control.updateCPUView();
                    _CPU.isExecuting = true;
                    _CPU.setState(_CurrentProcess.programCounter, _CurrentProcess.instructionRegister, _CurrentProcess.acc, _CurrentProcess.xReg, _CurrentProcess.yReg, _CurrentProcess.zFlag);
                }
                else {
                    let terminated = _PCBQueue.dequeue();
                    _MemoryManager.deallocateMemory(terminated);
                }
            }
            else {
                _CPU.init();
                _CPU.isExecuting = false;
            }
        }
    }
    TSOS.CpuDispatcher = CpuDispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuDispatcher.js.map