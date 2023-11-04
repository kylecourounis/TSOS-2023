/* ------------
   cpuDispatcher.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class CpuDispatcher {
        runningProcess;
        constructor(runningProcess = null) {
            this.runningProcess = runningProcess;
        }
        doContextSwitch() {
            if (_PCBQueue.getSize() > 0) {
                let headProcess = _PCBQueue.dequeue();
                console.log(headProcess);
                if (headProcess.state !== TSOS.State.TERMINATED) {
                    _CPU.isExecuting = false;
                    headProcess.state = TSOS.State.READY;
                    headProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                    TSOS.Control.updatePCBRow(headProcess);
                    _PCBQueue.enqueue(headProcess);
                    _CurrentProcess = _PCBQueue.head(); // get head of process queue
                    TSOS.Control.updatePCBRow(_CurrentProcess);
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
            if (_CurrentProcess != null) {
                _CPU.isExecuting = true;
                _CPU.setState(_CurrentProcess.programCounter, _CurrentProcess.instructionRegister, _CurrentProcess.acc, _CurrentProcess.xReg, _CurrentProcess.yReg, _CurrentProcess.zFlag);
                _CurrentProcess.state = TSOS.State.RUNNING;
                this.runningProcess = _CurrentProcess;
            }
        }
    }
    TSOS.CpuDispatcher = CpuDispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuDispatcher.js.map