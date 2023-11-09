/* ------------
   cpuScheduler.ts
   ------------ */

   module TSOS {
    export class CpuScheduler {
        constructor(public quantum: number = 6, public cycleCount: number = 0) {
        }

        public schedule() {
            _CPU.isExecuting = true;

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
        }
    }
}
