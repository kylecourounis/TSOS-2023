/* ------------
   cpuScheduler.ts
   ------------ */

   module TSOS {
    export class CpuScheduler {
        public quantum: number;
        public cycleCount: number;

        constructor(public type: SchedulingAlgorithm = SchedulingAlgorithm.RR) {
            this.quantum = 6;
            this.cycleCount = 0;

            this.setSchedule(type);
        }

        public schedule() {
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
                        _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_IRQ, []));
                    }
                    
                    this.cycleCount = 0;
                } else {
                    this.cycleCount++;
                }
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_IRQ, []));
            }
        }

        public setSchedule(type: SchedulingAlgorithm) {
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

    export enum SchedulingAlgorithm {
        FCFS = "First Come, First Serve",
        RR   = "Round Robin"
    }
}
