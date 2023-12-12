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
                                let data = sessionStorage.getItem(block).substring(8); // Skip 4 byte header

                                for (let i = 0; i < data.length; i += 2) {
                                    if (!isAtEnd) {
                                        let hexVal = data.substring(i, i + 2);

                                        if (hexVal === "00") {
                                            isAtEnd = true;
                                        } else {
                                            output += String.fromCharCode(parseInt(hexVal, 16));
                                        }
                                    }
                                }
                                
                                // If we're not at the end, go to the next block
                                if (!isAtEnd) {
                                    let nextTSB = sessionStorage.getItem(block).substring(2, 8);
                                    block = `${nextTSB.charAt(1)}:${nextTSB.charAt(3)}:${nextTSB.charAt(5)}`;
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

                let blocksUsed = 2; // start with the default

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
                    
                    let remainingContent = contentsAsHex;

                    // Find it interesting how much of this code I was just able to reuse from elsewhere in the file.
                    // The only tricky part was chaining it together to keep writing. 
                    // It was easier to read it back than it was to write. 

                    while (remainingContent.length > 0) {
                        if (sessionStorage.getItem(block).charAt(1) === "0") {
                            return FileStatus.INVALID_BLOCK; // Reusing the invalid block error to show that it's unavailable
                        } else {
                            let toWrite: string = remainingContent.substring(0, (BLOCK_SIZE - HEADER_SIZE) * 2).padEnd((BLOCK_SIZE - HEADER_SIZE) * 2, "0");

                            remainingContent = remainingContent.substring((BLOCK_SIZE - HEADER_SIZE) * 2);

                            // Write the contents to file with current header
                            sessionStorage.setItem(block, sessionStorage.getItem(block).substring(0, 8) + toWrite);

                            if (sessionStorage.getItem(block).substring(2, 8) === "------") {
                                needsNextBlock = false;
                            }

                            // Check to see if there is still more to write
                            if (remainingContent.length > 0) {
                                let newTSB = "";

                                if (needsNextBlock) {
                                    // Use the next block in the link because we know it is already reserved for the given file
                                    let linkedBlock = sessionStorage.getItem(block).substring(2, 8);
                                    newTSB = `${linkedBlock.charAt(1)}:${linkedBlock.charAt(3)}:${linkedBlock.charAt(5)}`;
                                } else {
                                    newTSB = this.firstAvailableFileBlock();
                                }

                                // If non-existent, then append EOF
                                if (newTSB === "") {
                                    sessionStorage.setItem(block, sessionStorage.getItem(block).substring(0, BLOCK_SIZE * 2 - 2) + "00");

                                    return FileStatus.PARTIALLY_WRITTEN;
                                } else {
                                    // We need to chain this file block to the next one
                                    let updatedFileBlock: string = sessionStorage.getItem(block).substring(0, 2) + "0" + newTSB.charAt(0) + "0" + newTSB.charAt(2) + "0" + newTSB.charAt(4) + sessionStorage.getItem(block).substring(8);
                                    sessionStorage.setItem(block, updatedFileBlock);

                                    // Set the status of the new block to be in use and as the end of the file
                                    sessionStorage.setItem(newTSB, "01" + sessionStorage.getItem(newTSB).substring(2, 8) + "0".repeat((BLOCK_SIZE - HEADER_SIZE) * 2));

                                    // Set the current TSB to the new TSB
                                    block = newTSB;

                                    if (!needsNextBlock) {
                                        // We took a block from storage, so we have to make sure that file restoration does not get screwed up in case we took a deleted file's first block
                                        for (let s = 0; s < SECTORS; s++) {
                                            for (let b = 0; b < BLOCKS; b++) {
                                                if (s === 0 && b === 0) {
                                                    // skip the MBR
                                                    continue;
                                                }

                                                let entry = sessionStorage.getItem(`0:${s}:${b}`);

                                                // Check to see if the directory entry is a deleted file
                                                if (entry.charAt(1) === "0" && entry.substring(8, 10) !== "00") {
                                                    let directoryFirstBlock: string = `${entry.charAt(3)}:${entry.charAt(5)}:${entry.charAt(7)}`;

                                                    if (directoryFirstBlock === block) {
                                                        sessionStorage.setItem(`0:${s}:${b}`, "00------" + entry.substring(8));
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                
                                blocksUsed++;
                            } else {
                                if (needsNextBlock) {
                                    let nextTSB = sessionStorage.getItem(block).substring(2, 8);
                                    
                                    while (nextTSB !== "------") {
                                        // Get the TSB key
                                        let nextKey = `${nextTSB.charAt(1)}:${nextTSB.charAt(3)}:${nextTSB.charAt(5)}`;

                                        // Set the block to available
                                        sessionStorage.setItem(nextKey, "00" + sessionStorage.getItem(nextKey).substring(2));

                                        // Continue
                                        nextTSB = sessionStorage.getItem(nextKey).substring(2, 8);
                                    }
                                }

                                // Close the chain
                                sessionStorage.setItem(block, sessionStorage.getItem(block).substring(0, 2) + "------" + sessionStorage.getItem(block).substring(8));
                            }
                        }
                    }

                    // Update the number of blocks in the directory entry, so we know how many blocks it takes to store
                    let fileDirTsb: string = this.getDirectoryEntry(filename);
                    sessionStorage.setItem(fileDirTsb, sessionStorage.getItem(fileDirTsb).substring(0, (BLOCK_SIZE - 1) * 2) + blocksUsed.toString(16).toUpperCase().padStart(2, "0"));

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
                let entry = sessionStorage.getItem(directory);

                // Get each number that represents the track, sector, and block
                tsb = `${entry.charAt(3)}:${entry.charAt(5)}:${entry.charAt(7)}`;
            }
            
            return tsb;
        }

        public getDirectoryEntry(fileToFind: string) {
            let location = "";

            for (let s = 0; s < SECTORS; s++) {
                for (let b = 0; b < BLOCKS; b++) {
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
                            return location;
                        }
                    }
                }
            }

            return location;
        }

        public firstAvailableDirectoryBlock() {
            let dir = "";

            for (let s = 0; s < SECTORS; s++) {
                for (let b = 0; b < BLOCKS; b++) {
                    // skip the MBR
                    if (s === 0 && b === 0) {
                        continue;
                    }
                    
                    // Check if it's 0, which means it's writable
                    if (sessionStorage.getItem(`0:${s}:${b}`).charAt(1) === "0") {
                        dir = `0:${s}:${b}`;
                        return dir;
                    }
                }
            }

            return dir;
        }

        public firstAvailableFileBlock() {
            let data = "";

            // Iterate on everything except track 0, because that's the directory portion
            for (let t = 1; t < TRACKS; t++) {
                for (let s = 0; s < SECTORS; s++) {
                    for (let b = 0; b < BLOCKS; b++) {
                        // Finally, check if it's 0, which means it's writable
                        if (sessionStorage.getItem(`${t}:${s}:${b}`).charAt(1) === "0") {
                            data = `${t}:${s}:${b}`;
                            return data;
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
        PARTIALLY_WRITTEN
    }
}