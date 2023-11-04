module TSOS {
    export class MemoryManager {
        // TODO for Project 3

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

                pcb.segment = segment; // Just for easy reference

                pcb.base = segment * 0x100;
                pcb.limit = (segment * 0x100) + 0x100;

                return true;
            } else {
                return false;
            }
        }

        public deallocateMemory(pcb: PCB) {
            if (pcb.state === State.TERMINATED) {
                this.availableSegments[pcb.segment] = true;
            }
        }
    }
}