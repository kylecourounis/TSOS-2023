/* ------------
   Swap.ts
   ------------ */
module TSOS {
    export class Swap {
        public swap(pcb: PCB) {
            if (!_MemoryManager.isSegmentAvailable()) {
                // Roll out MRU process
                this.rollOut(_PCBQueue.q[_PCBQueue.getSize() - 1]);
            }

            this.rollIn(pcb);
        }

        public rollIn(pcb: PCB) {
            let readResult = _krnDiskDriver.readSwapFile(pcb.swapFile);
            
            switch (readResult) {
                case FileStatus.DISK_NOT_FORMATTED: {
                    _Kernel.krnTrace(`The disk must be formatted before you can write to any file.`);
                    break;
                }

                case FileStatus.FILE_NOT_FOUND: {
                    _Kernel.krnTrace(`File not found.`);
                    break;
                }

                case FileStatus.READ_FROM_AVAILABLE_BLOCK: {
                    _Kernel.krnTrace(`Error: trying to read data from an available block.`);
                    break;
                }

                default: {
                    let newSegment = _MemoryManager.allocateMemoryForProgram(pcb, readResult);

                    pcb.segment = newSegment;
                    pcb.location = Location.MEMORY;

                    Control.updatePCBRow(pcb);

                    _Kernel.krnTrace(`Rolled in PID ${pcb.pid} to segment ${pcb.segment}.`);

                    break;
                }
            }

            _krnDiskDriver.deleteFile(pcb.swapFile);

            Control.updatePCBRow(pcb);
        }

        public rollOut(pcb: PCB) {
            if (pcb.state === State.READY) {
                _Kernel.krnCreateSwapFile(pcb);
            }

            _MemoryManager.deallocateMemory(pcb);

            pcb.segment = -1;
            pcb.location = Location.DISK_DRIVE;

            Control.updatePCBRow(pcb);
        }
    }
}