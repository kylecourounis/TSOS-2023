/* ------------
   cpuScheduler.ts
   ------------ */

   module TSOS {
    export class CpuScheduler {
        constructor(public quantum: number = 6, public cycleCount: number = 0) {
        }

        public schedule() {
            if (this.cycleCount == this.quantum) {
                // If there's only one program, we can just execute that normally.
                if (_PCBQueue.getSize() > 0) {
                    _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_IRQ, []));
                }
                
                this.cycleCount = 0;
            } else {
                this.cycleCount++;
            }
        }
    }
}
