/* ------------
   Swap.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class Swap {
        swap(pcb) {
            if (!_MemoryManager.isSegmentAvailable()) {
                // Roll out MRU process
                this.rollOut(_PCBQueue.q[_PCBQueue.getSize() - 1]);
            }
            this.rollIn(pcb);
        }
        rollIn(pcb) {
            let readResult = _krnDiskDriver.readSwapFile(pcb.swapFile);
            switch (readResult) {
                case TSOS.FileStatus.DISK_NOT_FORMATTED: {
                    _Kernel.krnTrace(`The disk must be formatted before you can write to any file.`);
                    break;
                }
                case TSOS.FileStatus.FILE_NOT_FOUND: {
                    _Kernel.krnTrace(`File not found.`);
                    break;
                }
                case TSOS.FileStatus.READ_FROM_AVAILABLE_BLOCK: {
                    _Kernel.krnTrace(`Error: trying to read data from an available block.`);
                    break;
                }
                default: {
                    let newSegment = _MemoryManager.allocateMemoryForProgram(pcb, readResult);
                    pcb.segment = newSegment;
                    pcb.location = TSOS.Location.MEMORY;
                    TSOS.Control.updatePCBRow(pcb);
                    _Kernel.krnTrace(`Rolled in PID ${pcb.pid} to segment ${pcb.segment}.`);
                    break;
                }
            }
            _krnDiskDriver.deleteFile(pcb.swapFile);
            TSOS.Control.updatePCBRow(pcb);
        }
        rollOut(pcb) {
            if (pcb.state === TSOS.State.READY) {
                _Kernel.krnCreateSwapFile(pcb);
            }
            _MemoryManager.deallocateMemory(pcb);
            pcb.segment = -1;
            pcb.location = TSOS.Location.DISK_DRIVE;
            TSOS.Control.updatePCBRow(pcb);
        }
    }
    TSOS.Swap = Swap;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swap.js.map