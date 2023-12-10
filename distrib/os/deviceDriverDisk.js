/* ----------------------------------
   deviceDriverDisk.ts

   The Kernel Disk Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    const TRACKS = 4;
    const SECTORS = 8;
    const BLOCKS = 8;
    const HEADER_SIZE = 4;
    const BLOCK_SIZE = 64;
    const FILE_NAME_LENGTH = 54;
    // Extends DeviceDriver
    class DeviceDriverDisk extends TSOS.DeviceDriver {
        formatted = false;
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnDiskDriverEntry;
        }
        krnDiskDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
            // More?
        }
        formatDisk(quick = false) {
            for (let t = 0; t < TRACKS; t++) {
                for (let s = 0; s < SECTORS; s++) {
                    for (let b = 0; b < BLOCKS; b++) {
                        // Only allow a quick format if the disk has already been formatted with 00s
                        if (this.formatted && quick) {
                            // Data can stay, just mark the data as writable
                            sessionStorage.setItem(`${t}:${s}:${b}`, "00------" + sessionStorage.getItem(`${t}:${s}:${b}`).substring(8));
                        }
                        else {
                            // Set each block to be 0s
                            // You said to do something with dashes - pretty sure this is what it was? 
                            // If not, doesn't seem to affect anything lol - I even tested it if I did all zeros here.
                            sessionStorage.setItem(`${t}:${s}:${b}`, "00------" + "0".repeat((BLOCK_SIZE - (HEADER_SIZE * 2)) * 2));
                        }
                    }
                }
            }
            // TODO - create visual
            this.formatted = true;
        }
        createFile(filename) {
            if (this.formatted) {
                let firstAvailDir = this.firstAvailableDirectoryBlock();
                let firstAvailFile = this.firstAvailableFileBlock();
                if (firstAvailDir === "") {
                    return FileStatus.NO_DIRECTORY_SPACE;
                }
                else if (firstAvailFile === "") {
                    return FileStatus.NO_DATA_BLOCKS;
                }
                else {
                    let fileExists = this.getDirectoryEntry(filename);
                    if (fileExists === "") {
                        let newEntry = "01";
                        // i += 2 because two characters is one byte
                        for (let i = 0; i < firstAvailFile.length; i += 2) {
                            newEntry += "0" + firstAvailFile.charAt(i);
                        }
                        let nameAsHex = "";
                        for (let i = 0; i < filename.length; i++) {
                            nameAsHex += filename.charCodeAt(i).toString(16).padStart(2, "0").toUpperCase();
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
                        // Not entirely necessary, but mark the end of the entry in case we ever need to check against it
                        newEntry += "00";
                        // Save it on the disk in both the directory portion and the file portion
                        sessionStorage.setItem(firstAvailDir, newEntry);
                        sessionStorage.setItem(firstAvailFile, "01000000".padEnd(BLOCK_SIZE * 2, "0"));
                        return FileStatus.SUCCESS;
                    }
                    else {
                        return FileStatus.FILE_EXISTS;
                    }
                }
            }
            else {
                return FileStatus.DISK_NOT_FORMATTED;
            }
        }
        readFile(filename) {
        }
        renameFile(filename) {
        }
        writeFile(filename) {
        }
        listFiles() {
            let fileList = [];
            if (this.formatted) {
                for (let s = 0; s < SECTORS; s++) {
                    for (let b = 0; b < BLOCKS; b++) {
                        // skip MBR
                        if (s === 0 && b === 0) {
                            continue;
                        }
                        let entry = sessionStorage.getItem(`0:${s}:${b}`);
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
                                    }
                                    else {
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
                            let fileEntry = {
                                name: filename,
                                dateCreated: date
                            };
                            fileList.push(fileEntry);
                        }
                    }
                }
            }
            else {
                // Set the list to something that marks it as the disk not being formatted
                fileList = null;
            }
            return fileList;
        }
        getDirectoryEntry(fileToFind) {
            let location = "";
            for (let s = 0; s < SECTORS; s++) {
                if (location === "") {
                    for (let b = 0; b < BLOCKS; b++) {
                        if (location === "") {
                            // skip MBR
                            if (s === 0 && b === 0) {
                                continue;
                            }
                            let tsb = `0:${s}:${b}`;
                            let entry = sessionStorage.getItem(tsb);
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
                                        }
                                        else {
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
        firstAvailableDirectoryBlock() {
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
        firstAvailableFileBlock() {
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
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
    let FileStatus;
    (function (FileStatus) {
        FileStatus[FileStatus["SUCCESS"] = 0] = "SUCCESS";
        FileStatus[FileStatus["DISK_NOT_FORMATTED"] = 1] = "DISK_NOT_FORMATTED";
        FileStatus[FileStatus["FILE_NOT_FOUND"] = 2] = "FILE_NOT_FOUND";
        FileStatus[FileStatus["FILE_EXISTS"] = 3] = "FILE_EXISTS";
        FileStatus[FileStatus["NO_DIRECTORY_SPACE"] = 4] = "NO_DIRECTORY_SPACE";
        FileStatus[FileStatus["NO_DATA_BLOCKS"] = 5] = "NO_DATA_BLOCKS";
    })(FileStatus = TSOS.FileStatus || (TSOS.FileStatus = {}));
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map