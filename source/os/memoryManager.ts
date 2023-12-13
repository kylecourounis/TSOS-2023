module TSOS {
    export class MemoryManager {
        public availableSegments: boolean[];

        constructor() {
            this.availableSegments = [true, true, true];
        }

        public allocateMemoryForProgram(pcb: PCB, program: string[]): boolean {
            if (program.length > 0x100) {
                _StdOut.putText("Program is too large!");
                return;
            }
            
            if (_PCBQueue.getSize() < 3) {
                let segment = -1;

                for (let i = 0; i < this.availableSegments.length; i++) {
                    if (this.availableSegments[i] == true) {
                        segment = i;

                        this.availableSegments[i] = false;

                        
                        break;
                    }
                }

                for (let i = 0; i < program.length; i++) {
                    _MemAccessor.writeImmediate(segment * 0x100 + i, parseInt(program[i], 16));
                }

                pcb.segment = segment;

                pcb.base = segment * 0x100;
                pcb.limit = (segment * 0x100) + 0x100 - 1;

                return true;
            } else {
                return false;
            }
        }

        public deallocateTerminatedProcesses() {
            for (let i = 0; i < _PCBQueue.getSize(); i++) {
                let pcb: PCB = _PCBQueue.q[i];

                if (pcb.state === State.TERMINATED) {
                    _Memory.clearMemory(pcb.base, 0x100); // clear the portion of memory where this whole program is stored.
                    this.availableSegments[pcb.segment] = true;
                }
            }
        }

        public deallocateMemory(pcb: PCB) {
            if (pcb.state === State.TERMINATED) {
                _Memory.clearMemory(pcb.base, 0x100); // clear the portion of memory where this whole program is stored.
                this.availableSegments[pcb.segment] = true;
            }
        }


        public isSegmentAvailable() {
            return this.availableSegments.includes(true); 
        }
    }
}