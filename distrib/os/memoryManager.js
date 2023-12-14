var TSOS;
(function (TSOS) {
    class MemoryManager {
        availableSegments;
        constructor() {
            this.availableSegments = [true, true, true];
        }
        allocateMemoryForProgram(pcb, program) {
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
                    _MemAccessor.writeImmediate(pcb.segment * 0x100 + i, parseInt(program[i], 16));
                }
                return segment;
            }
            else {
                return -1;
            }
        }
        deallocateTerminatedProcesses() {
            for (let i = 0; i < _PCBQueue.getSize(); i++) {
                let pcb = _PCBQueue.q[i];
                if (pcb.state === TSOS.State.TERMINATED) {
                    _Memory.clearMemory(pcb.base, pcb.limit); // clear the portion of memory where this whole program is stored.
                    this.availableSegments[pcb.segment] = true;
                }
            }
        }
        deallocateMemory(pcb) {
            _Memory.clearMemory(pcb.base, pcb.limit); // clear the portion of memory where this whole program is stored.
            this.availableSegments[pcb.segment] = true;
        }
        isSegmentAvailable() {
            return this.availableSegments.includes(true);
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map