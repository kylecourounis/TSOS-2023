/* ----------------------------------
   deviceDriverDisk.ts

   The Kernel Disk Device Driver.
   ---------------------------------- */

module TSOS {
    const TRACKS: number = 4;
    const SECTORS: number = 8;
    const BLOCKS: number = 8;
    const BLOCK_SIZE: number = 64;

    // Extends DeviceDriver
    export class DeviceDriverDisk extends DeviceDriver {
        public formatted: boolean = false;
        
        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnDiskDriverEntry;
        }

        public krnDiskDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
            // More?
        }

        public formatDisk(quick: boolean = false) {
            for (let t: number = 0; t < TRACKS; t++) {
                for (let s: number = 0; s < SECTORS; s++) {
                    for (let b: number = 0; b < BLOCKS; b++) {
                        // Only allow a quick format if the disk has already been formatted with 00s
                        if (this.formatted && quick) {
                            // Data can stay, just mark the data as writable
                            sessionStorage.setItem(`${t}:${s}:${b}`, '00FFFFFF' + sessionStorage.getItem(`${t}:${s}:${b}`).substring(8));
                        } else {
                            // Set each block to be 0s
                            // 2 * (block size - 4) is the number of 0s needed because 2 hex digits is 1 byte and we are starting with a 4 byte overhead
                            sessionStorage.setItem(`${t}:${s}:${b}`, '00FFFFFF' + '0'.repeat((BLOCK_SIZE - 4) * 2));
                        }
                    }
                }
            }

            // TODO - create visual

            this.formatted = true;
        }

        public findFile(filename: string) {
            for (let s: number = 0; s < SECTORS; s++) {
                for (let b: number = 0; b < BLOCKS; b++) {
                    
                }
            }
        }
    }
}