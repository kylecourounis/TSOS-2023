module TSOS {
    export class MemoryManager {
        public availableSegments: boolean[];

        constructor() {
            this.availableSegments = [true, true, true];
        }

        public allocateMemoryForProgram(pcb: PCB, program: string[]): number {
            if (program.length > 0x100) {
                _StdOut.putText("Program is too large!");
                return;
            }
            
            let progs = _PCBQueue.q.filter(pcb => pcb.segment !== -1);

            if (progs.length < 3) {
                let segment = -1;

                for (let i = 0; i < this.availableSegments.length; i++) {
                    if (this.availableSegments[i] == true) {
                        segment = i;
                        
                        this.availableSegments[i] = false;
                        
                        break;
                    }
                }

                pcb.segment = segment;

                pcb.base = segment * 0x100;
                pcb.limit = (segment * 0x100) + 0x100 - 1;
                
                for (let i = 0; i < program.length; i++) {
                    _MemAccessor.writeImmediate(pcb.segment * 0x100 + i, parseInt(program[i], 16), true);
                }

                return segment;
            } else {
                return -1;
            }
        }

        public deallocateTerminatedProcesses() {
            for (let i = 0; i < _PCBQueue.getSize(); i++) {
                let pcb: PCB = _PCBQueue.q[i];

                if (pcb.state === State.TERMINATED) {
                    _Memory.clearMemory(pcb.base, pcb.limit); // clear the portion of memory where this whole program is stored.
                    this.availableSegments[pcb.segment] = true;
                }
            }
        }

        public deallocateMemory(pcb: PCB) {
            _Memory.clearMemory(pcb.base, pcb.limit); // clear the portion of memory where this whole program is stored.
            this.availableSegments[pcb.segment] = true;
        }

        public isSegmentAvailable() {
            return this.availableSegments.includes(true); 
        }
    }
}