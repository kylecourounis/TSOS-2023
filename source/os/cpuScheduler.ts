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
                // If there's only one program, we can just execute that normally.
                 _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_IRQ, []));
                
                this.cycleCount = 0;
            } else {
                this.cycleCount++;
            }
        }
    }
}
