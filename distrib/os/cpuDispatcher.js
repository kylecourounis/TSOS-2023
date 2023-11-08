/* ------------
   cpuDispatcher.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class CpuDispatcher {
        doContextSwitch() {
            if (_PCBQueue.getSize() > 0) {
                let headProcess = _PCBQueue.dequeue();
                if (headProcess.state !== TSOS.State.TERMINATED) {
                    headProcess.state = TSOS.State.READY;
                    headProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                    TSOS.Control.updatePCBRow(headProcess);
                    _PCBQueue.enqueue(headProcess);
                    _CurrentProcess = _PCBQueue.head(); // get head of process queue
                    _CurrentProcess.state = TSOS.State.RUNNING;
                    console.log(_CurrentProcess);
                    TSOS.Control.updatePCBRow(_CurrentProcess);
                    TSOS.Control.updateCPUView();
                    _CPU.setState(_CurrentProcess.programCounter, _CurrentProcess.instructionRegister, _CurrentProcess.acc, _CurrentProcess.xReg, _CurrentProcess.yReg, _CurrentProcess.zFlag);
                }
                else {
                    _Kernel.krnTerminateProcess(headProcess);
                }
                if (_CPU.breakFlag) {
                    _Kernel.krnTerminateProcess(headProcess);
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