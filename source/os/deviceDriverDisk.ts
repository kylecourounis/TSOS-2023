/* ----------------------------------
   deviceDriverDisk.ts

   The Kernel Disk Device Driver.
   ---------------------------------- */

module TSOS {
    const TRACKS: number = 4;
    const SECTORS: number = 8;
    const BLOCKS: number = 8;

    const HEADER_SIZE: number = 4;
    const BLOCK_SIZE: number = 64;

    const FILE_NAME_LENGTH: number = 54; // because we're storing the date as well

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
            for (let t = 0; t < TRACKS; t++) {
                for (let s = 0; s < SECTORS; s++) {
                    for (let b = 0; b < BLOCKS; b++) {
                        // Only allow a quick format if the disk has already been formatted with 00s
                        if (this.formatted && quick) {
                            // Data can stay, just mark the data as writable
                            sessionStorage.setItem(`${t}:${s}:${b}`, "00------" + sessionStorage.getItem(`${t}:${s}:${b}`).substring(8));
                        } else {
                            // Set each block to be 0s
                            // Use -- so that we don't point to the MBR
                            sessionStorage.setItem(`${t}:${s}:${b}`, "00------" + "0".repeat((BLOCK_SIZE - (HEADER_SIZE * 2)) * 2));
                        }
                    }
                }
            }

            // TODO - create visual

            this.formatted = true;
        }

        public createFile(filename: string) {
            if (this.formatted) {
                let firstAvailDir = this.firstAvailableDirectoryBlock();
                let firstAvailFile = this.firstAvailableFileBlock();

                if (firstAvailDir === "") {
                    return FileStatus.NO_DIRECTORY_SPACE;
                } else if (firstAvailFile === "") {
                    return FileStatus.NO_DATA_BLOCKS;
                } else {
                    let fileExists = this.getDirectoryEntry(filename);

                    // If it returns an empty string, the file doesn't exist, so we're safe to create it
                    if (fileExists === "") {
                        let newEntry = "01";

                        // i += 2 because two characters is one byte
                        for (let i = 0; i < firstAvailFile.length; i += 2) {
                            newEntry += "0" + firstAvailFile.charAt(i);
                        }
    
                        let nameAsHex = "";
    
                        for (let i = 0; i < filename.length; i++) {
                            // padStart is used to ensure the size of each byte
                            nameAsHex += this.toHex(filename, i);
                        }
    
                        // Pad the rest with 0s
                        nameAsHex = nameAsHex.padEnd(FILE_NAME_LENGTH * 2, "0");
    
                        // Marks the end of the file name
                        nameAsHex += "00";
    
                        newEntry += nameAsHex;
                        
                        let date = new Date().toLocaleDateString().split("/");

                        for (let i = 0; i < date.length; i++) {
                            let hexNum = parseInt(date[i]).toString(16).toUpperCase();
                        
                            // Check whether or not the number is more than one character
                            // If it's not, we need to prepend it with a zero
                            if (hexNum.length % 2 === 1) {
                                hexNum = "0" + hexNum;
                            }
                            
                            date[i] = hexNum;
                        }
                        
                        newEntry += date.join("");

                        // This is the number of blocks that the file is used to write
                        // 2 by default - one for directory entry, one for the file, however, this can expand
                        newEntry += "02";

                        // Save it on the disk in both the directory portion and the file portion
                        sessionStorage.setItem(firstAvailDir, newEntry);
                        sessionStorage.setItem(firstAvailFile, "01000000".padEnd(BLOCK_SIZE * 2, "0"));

                        return FileStatus.SUCCESS;
                    } else {
                        return FileStatus.FILE_EXISTS;
                    }
                }
            } else {
                return FileStatus.DISK_NOT_FORMATTED;
            }
        }

        public readFile(filename: string) {
            let output = "";
            
            if (this.formatted) {
                let block = this.getFirstBlockForFile(filename);

                if (block !== "") {
                    let isAtEnd = false;

                    // Continue until the end of the file or an error
                    while (!isAtEnd) {
                        // Make sure we have a file initialized at that block
                        if (block !== '-:-:-') {
                            if (sessionStorage.getItem(block).charAt(1) === "1") { 
                                let data: string = sessionStorage.getItem(block).substring(8); // Skip 4 byte header

                                for (let i = 0; i < data.length; i += 2) {
                                    if (!isAtEnd) {
                                        let hexVal: string = data.substring(i, i + 2);

                                        if (hexVal === "00") {
                                            isAtEnd = true;
                                        } else {
                                            output += String.fromCharCode(parseInt(hexVal, 16));
                                        }
                                        
                                        // Go to the next block if needed
                                        let nextTSB: string = sessionStorage.getItem(block).substring(2, 8);
                                        block = `${nextTSB.charAt(1)}:${nextTSB.charAt(3)}:${nextTSB.charAt(5)}`
                                    }
                                }
                            } else {
                                return FileStatus.READ_FROM_AVAILABLE_BLOCK;
                            }
                        } else {
                            return FileStatus.INVALID_BLOCK;
                        }
                    }
                } else {
                    return FileStatus.FILE_NOT_FOUND;
                }
            } else {
                return FileStatus.DISK_NOT_FORMATTED;
            }

            return output;
        }

        public renameFile(currentFilename: string, newFilename: string) {
            if (this.formatted) {
                let directoryEntry = this.getDirectoryEntry(currentFilename);
                let newDirectoryEntry = this.getDirectoryEntry(newFilename);

                if (directoryEntry === "") {
                    return FileStatus.FILE_NOT_FOUND;
                } else if (newDirectoryEntry !== "") {
                    return FileStatus.DUPLICATE_NAME;
                } else {
                    let nameAsHex = "";

                    for (let i: number = 0; i < newFilename.length; i++) {
                        nameAsHex += this.toHex(newFilename, i);
                    }
                    
                    nameAsHex = nameAsHex.padEnd(FILE_NAME_LENGTH * 2, "0");

                    let metadata: string = sessionStorage.getItem(directoryEntry).substring(8 + FILE_NAME_LENGTH * 2);

                    sessionStorage.setItem(directoryEntry, sessionStorage.getItem(directoryEntry).substring(0, 8) + nameAsHex + metadata);

                    // TODO: Update visual

                    return FileStatus.SUCCESS;
                }
            } else {
                return FileStatus.DISK_NOT_FORMATTED;
            }
        }

        // The raw flag is used for swap files
        public writeFile(filename: string, contents: string, raw: boolean) {
            if (this.formatted) {
                let block = this.getFirstBlockForFile(filename);

                // If empty string is returned, file is not found
                if (block !== "") {
                    let contentsAsHex = '';

                    if (raw) {
                        contentsAsHex = contents;
                    } else {
                        // If not raw, we need to convert
                        for (let i = 0; i < contents.length; i++) {
                            // Hex representation the same as above
                            contentsAsHex += this.toHex(contents, i);
                        }
                    }

                    // Add EOF
                    contentsAsHex += "00";

                    // By default this is true so that we can use as many blocks as needed to write the contents.
                    let needsNextBlock = true;
                    
                    

                    return FileStatus.SUCCESS;
                } else {
                    return FileStatus.FILE_NOT_FOUND;
                }
            } else {
                return FileStatus.DISK_NOT_FORMATTED;
            }
        }

        public listFiles() {
            let fileList = [];

            if (this.formatted) {
                for (let s = 0; s < SECTORS; s++) {
                    for (let b = 0; b < BLOCKS; b++) {
                        // skip MBR
                        if (s === 0 && b === 0) {
                            continue;
                        }

                        let entry: string = sessionStorage.getItem(`0:${s}:${b}`);

                        // Ensure we've written to this position on the disk
                        if (entry.charAt(1) === "1") {
                            // File name starts after 4 bytes (8 characters)
                            let hexName = entry.substring(8);
                            
                            let filename = "";
                            let isAtEnd = false;

                            // Two characters is a byte
                            for (let i = 0; i < hexName.length; i += 2) {
                                if (!isAtEnd) {
                                    let hexVal = hexName.substring(i, i + 2);
                                    let charCode = parseInt(hexVal, 16);

                                    if (charCode === 0) {
                                        isAtEnd = true;
                                    } else {
                                        filename += String.fromCharCode(charCode);
                                    }
                                }
                            }

                            let metadata = entry.substring((BLOCK_SIZE - 5) * 2);
                            
                            // Convert back from base 16
                            let month = parseInt(metadata.substring(0, 2), 16);
                            let day = parseInt(metadata.substring(2, 4), 16);
                            let year = parseInt(metadata.substring(4, 8), 16);

                            let date = `${month}/${day}/${year}`;
                            
                            // Create the file entry
                            // Made this an object so that it's appendable
                            // I think I'd still have to update the file name length if I wanted any more metadata
                            let fileEntry = {
                                name: filename,
                                dateCreated: date
                            };

                            fileList.push(fileEntry);
                        }
                    }
                }
            } else {
                // Set the list to something that marks it as the disk not being formatted
                fileList = null;
            }

            return fileList;
        }

        public getFirstBlockForFile(fileToFind: string) {
            let tsb = "";

            let directory: string = this.getDirectoryEntry(fileToFind);

            // Ensure the file exists
            if (directory !== "") {
                let directoryEntry = sessionStorage.getItem(directory);

                // Get each byte that represent the track, sector, and block
                try {
                    let track = parseInt(directoryEntry.substring(2, 3), 16);
                    let sector = parseInt(directoryEntry.substring(4, 5), 16);
                    let block = parseInt(directoryEntry.substring(6, 7), 16);
    
                    tsb = `${track}:${sector}:${block}`;
                } catch {
                    // If there's an error parsing, it's because these aren't ints.
                    tsb = `-:-:-`;
                }
            }
            
            return tsb;
        }

        public getDirectoryEntry(fileToFind: string) {
            let location = "";

            for (let s = 0; s < SECTORS; s++) {
                if (location === "") {
                    for (let b = 0; b < BLOCKS; b++) {
                        if (location === "") {
                            // skip MBR
                            if (s === 0 && b === 0) {
                                continue;
                            }
        
                            let tsb: string = `0:${s}:${b}`;
                            let entry: string = sessionStorage.getItem(tsb);
        
                            // Ensure we've written to this position on the disk
                            if (entry.charAt(1) === "1") {
                                // File name starts after 4 bytes (8 characters)
                                let hexName = entry.substring(8);
                                
                                let filename = "";
                                let isAtEnd = false;
        
                                // Two characters is a byte
                                for (let i = 0; i < hexName.length; i += 2) {
                                    if (!isAtEnd) {
                                        let hexVal = hexName.substring(i, i + 2);
                                        let charCode = parseInt(hexVal, 16);
        
                                        if (charCode === 0) {
                                            isAtEnd = true;
                                        } else {
                                            filename += String.fromCharCode(charCode);
                                        }
                                    }
                                }
        
                                if (filename == fileToFind) {
                                    location = tsb;
                                }
                            }
                        }
                    }
                }
            }

            return location;
        }

        public firstAvailableDirectoryBlock() {
            let dir = "";

            for (let s = 0; s < SECTORS; s++) {
                if (dir === "") {
                    for (let b = 0; b < BLOCKS; b++) {
                        if (dir === "") {
                            // skip the MBR
                            if (s === 0 && b === 0) {
                                continue;
                            }
                            
                            // Check if it's 0, which means it's writable
                            if (sessionStorage.getItem(`0:${s}:${b}`).charAt(1) === "0") {
                                dir = `0:${s}:${b}`;
                            }
                        }
                    }

                }
            }

            return dir;
        }

        public firstAvailableFileBlock() {
            let data = "";

            // Iterate on everything except track 0, because that's the directory portion
            for (let t = 1; t < TRACKS; t++) {
                if (data === "") {
                    for (let s = 0; s < SECTORS; s++) {
                        if (data === "") {
                            for (let b = 0; b < BLOCKS; b++) {
                                if (data === "") {
                                    // Finally, check if it's 0, which means it's writable
                                    if (sessionStorage.getItem(`${t}:${s}:${b}`).charAt(1) === "0") {
                                        data = `${t}:${s}:${b}`;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return data;
        }

        private toHex(value: string, index: number) {
            return value.charCodeAt(index).toString(16).padStart(2, "0").toUpperCase();
        }
    }

    export enum FileStatus {
        SUCCESS,
        DISK_NOT_FORMATTED,
        FILE_NOT_FOUND,
        FILE_EXISTS,
        NO_DIRECTORY_SPACE,
        NO_DATA_BLOCKS,
        READ_FROM_AVAILABLE_BLOCK,
        INVALID_BLOCK,
        DUPLICATE_NAME,
    }
}