/* ------------
   cpuScheduler.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class CpuScheduler {
        quantum;
        currentQuantum;
        constructor(quantum = 6, currentQuantum = 0) {
            this.quantum = quantum;
            this.currentQuantum = currentQuantum;
        }
        schedule() {
            if (this.currentQuantum == this.quantum) {
                _CpuDispatcher.doContextSwitch();
            }
            else {
                this.currentQuantum++;
            }
        }
    }
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map