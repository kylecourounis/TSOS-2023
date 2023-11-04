module TSOS {
    export class MemoryManager {
        // TODO for Project 3

        public availableSegments: boolean[];

        constructor() {
            this.availableSegments = [true, true, true];
        }

        public allocateMemoryForProgram(program: string[]): void {
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
            }
        }
    }
}