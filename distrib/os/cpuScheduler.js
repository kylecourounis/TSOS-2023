/* ------------
   cpuScheduler.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class CpuScheduler {
        quantum;
        cycleCount;
        constructor(quantum = 6, cycleCount = 0) {
            this.quantum = quantum;
            this.cycleCount = cycleCount;
        }
        schedule() {
            _CPU.isExecuting = true;
            if (this.cycleCount >= this.quantum) {
                // If there's only one program, we can just execute that normally.
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_IRQ, []));
                this.cycleCount = 0;
            }
            else {
                this.cycleCount++;
            }
        }
    }
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map