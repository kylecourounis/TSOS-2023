/* ------------
   cpuDispatcher.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class CpuDispatcher {
        doContextSwitch() {
            if (_PCBQueue.getSize() > 0) {
                let runningProcess = _CurrentProcess;
                if (runningProcess) {
                    _CurrentProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                    _CPU.init();
                    _CurrentProcess.state = TSOS.State.READY;
                    TSOS.Control.updatePCBRow(_CurrentProcess);
                    _PCBQueue.enqueue(_CurrentProcess);
                }
                _CurrentProcess = _PCBQueue.dequeue();
                if (_CurrentProcess.location === TSOS.Location.DISK_DRIVE) {
                    _Swap.swap(_CurrentProcess);
                }
                _CurrentProcess.state = TSOS.State.RUNNING;
                /* console.log(`${_CurrentProcess.pid} (${_CurrentProcess.segment}): ${_CurrentProcess.base}-${_CurrentProcess.limit}`);
                console.log(_MemAccessor.getRange(_CurrentProcess.base, _CurrentProcess.limit));
                console.log("\n"); */
                TSOS.Control.updatePCBRow(_CurrentProcess);
                TSOS.Control.updateCPUView();
                _CPU.setState(_CurrentProcess.programCounter, _CurrentProcess.instructionRegister, _CurrentProcess.acc, _CurrentProcess.xReg, _CurrentProcess.yReg, _CurrentProcess.zFlag);
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