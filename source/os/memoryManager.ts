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
                
            }
        }
    }
}