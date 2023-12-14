/* ------------
   cpuScheduler.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class CpuScheduler {
        type;
        quantum;
        cycleCount;
        constructor(type = SchedulingAlgorithm.RR) {
            this.type = type;
            this.quantum = 6;
            this.cycleCount = 0;
            // this.setSchedule(type);
        }
        schedule() {
            _CPU.isExecuting = true;
            if (this.type == SchedulingAlgorithm.RR) {
                if (this.cycleCount == this.quantum) {
                    // Wait for the cycle to complete before calling the rest of the function
                    while (!_CPU.completedCycle) {
                        //...
                    }
                    if (_PCBQueue.getSize() > 0) {
                        // If there's only one program, we can just execute that normally.
                        _Kernel.krnTrace("Scheduler invoked dispatcher");
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_IRQ, []));
                    }
                    this.cycleCount = 0;
                }
                else {
                    this.cycleCount++;
                }
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_IRQ, []));
            }
        }
        setSchedule(type) {
            this.type = type;
            switch (type) {
                case SchedulingAlgorithm.RR: {
                    this.quantum = 6;
                    break;
                }
                case SchedulingAlgorithm.FCFS: {
                    this.quantum = Number.MAX_VALUE;
                    break;
                }
            }
        }
    }
    TSOS.CpuScheduler = CpuScheduler;
    let SchedulingAlgorithm;
    (function (SchedulingAlgorithm) {
        SchedulingAlgorithm["FCFS"] = "First Come, First Serve";
        SchedulingAlgorithm["RR"] = "Round Robin";
    })(SchedulingAlgorithm = TSOS.SchedulingAlgorithm || (TSOS.SchedulingAlgorithm = {}));
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map