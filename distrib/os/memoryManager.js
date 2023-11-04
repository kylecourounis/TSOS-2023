var TSOS;
(function (TSOS) {
    class MemoryManager {
        // TODO for Project 3
        availableSegments;
        constructor() {
            this.availableSegments = [true, true, true];
        }
        allocateMemoryForProgram(program) {
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
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map