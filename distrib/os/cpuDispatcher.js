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
                    _CPU.init();
                    _CurrentProcess.state = TSOS.State.READY;
                    _PCBQueue.enqueue(_CurrentProcess);
                }
                console.log(JSON.stringify(_PCBQueue));
                _CurrentProcess = _PCBQueue.dequeue();
                _CurrentProcess.state = TSOS.State.RUNNING;
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