/* ------------
   cpuScheduler.ts
   ------------ */

   module TSOS {
    export class CpuScheduler {
        constructor(public quantum: number = 6, public currentQuantum: number = 0) {
        }

        public schedule() {
            if (this.currentQuantum == this.quantum) {
                _CpuDispatcher.doContextSwitch();
            } else {
                this.currentQuantum++;
            }
        }
    }
}
