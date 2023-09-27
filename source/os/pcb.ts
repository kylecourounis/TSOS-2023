/* ------------
   PCB.ts
   ------------ */
module TSOS {
    export class PCB {
        public static pidStore: number = 0;

        public pid: number;

        constructor() {
            this.pid = PCB.pidStore;
            PCB.pidStore++;
        }
    }
}
