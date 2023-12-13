/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        // Properties
        promptStr = ">";
        commandList = [];
        curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        apologies = "[sorry]";
        previousCommands;
        previousCommandIdx;
        constructor() {
        }
        init() {
            this.previousCommands = [];
            this.previousCommandIdx = 0;
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time in the shell.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Tells the user where they are.");
            this.commandList[this.commandList.length] = sc;
            // quote
            sc = new TSOS.ShellCommand(this.shellRandomQuote, "quote", "- Tells the user a random quote.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<value> - Sets the value of the status element on the VM.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validates the user code from the textarea.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Executes the program with the specified process id.");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Triggers the trap error function.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearMemory, "clearmem", "- Clears the entire memory.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Runs up to three programs in memory.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- Displays PIDs and statuses.");
            this.commandList[this.commandList.length] = sc;
            // kill
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - Kills the process with the specified ID.");
            this.commandList[this.commandList.length] = sc;
            // killall
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- Kills all running processes.");
            this.commandList[this.commandList.length] = sc;
            // quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<value> - Sets the Round Robin quantum.");
            this.commandList[this.commandList.length] = sc;
            // format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "[-quick/-full] - Initialize all blocks in all sectors in all tracks");
            this.commandList[this.commandList.length] = sc;
            // create
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<filename> - Creates a file with the specified name");
            this.commandList[this.commandList.length] = sc;
            // read
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<filename> - Reads a file with the specified name");
            this.commandList[this.commandList.length] = sc;
            // write
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "<filename> \"data\" - Writes the data to a file with the specified name");
            this.commandList[this.commandList.length] = sc;
            // delete
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<filename> - Deletes a file with the specified name");
            this.commandList[this.commandList.length] = sc;
            // copy
            sc = new TSOS.ShellCommand(this.shellCopy, "copy", "<existing filename> <new filename> - Copies a file");
            this.commandList[this.commandList.length] = sc;
            // rename
            sc = new TSOS.ShellCommand(this.shellRename, "rename", "<existing filename> <new filename> - Renames a file");
            this.commandList[this.commandList.length] = sc;
            // ls
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "[-a] - Lists all files (can utilize optional arguments)");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
            if (cmd.length > 0) {
                let prevCommand = cmd + " " + args.toString().replaceAll(",", " "); // the formatted version with arguments.
                this.previousCommands.push(prevCommand);
            }
            this.previousCommandIdx = this.previousCommands.length; // We subtract 1 when we reference it, so we don't need to do it here
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Displays the current version of the operating system.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the shell.");
                        break;
                    case "trace":
                        _StdOut.putText("Turns the OS trace on or off.");
                        break;
                    case "rot13":
                        _StdOut.putText("Does rot13 obfuscation on a specified string.");
                        break;
                    case "prompt":
                        _StdOut.putText("Sets the prompt string. (Replaces the default '>')");
                        break;
                    case "date":
                        _StdOut.putText("Returns the current date and time.");
                        break;
                    case "whereami":
                        _StdOut.putText("Returns your current location.");
                        break;
                    case "quote":
                        _StdOut.putText("Prints a random quote to the user.");
                        break;
                    case "status":
                        _StdOut.putText("Sets the status message on the host window.");
                        break;
                    case "load":
                        _StdOut.putText("Validates the user code from the text area to ensure it has only hex and/or spaces.");
                        break;
                    case "run":
                        _StdOut.putText("Runs the program with the specified process id.");
                        break;
                    case "bsod":
                        _StdOut.putText("Triggers a BSOD for testing purposes.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears memory (this has some guardrails for running programs).");
                        break;
                    case "runall":
                        _StdOut.putText("Runs up to three programs in memory.");
                        break;
                    case "ps":
                        _StdOut.putText("Displays all PIDs and process states to the user.");
                        break;
                    case "kill":
                        _StdOut.putText("Kills the process with the specified ID.");
                        break;
                    case "killall":
                        _StdOut.putText("Kills all the processes.");
                        break;
                    case "quantum":
                        _StdOut.putText("Sets the Round Robin quantum.");
                        break;
                    case "format":
                        _StdOut.putText("Formats the disk by initializing all blocks in all sectors in all tracks.");
                        break;
                    case "create":
                        _StdOut.putText("Creates a file.");
                        break;
                    case "read":
                        _StdOut.putText("Read and display contents of filename.");
                        break;
                    case "write":
                        _StdOut.putText("Writes a file with the specified filename.");
                        break;
                    case "delete":
                        _StdOut.putText("Removes a file from storage.");
                        break;
                    case "copy":
                        _StdOut.putText("Makes a copy of a file.");
                        break;
                    case "rename":
                        _StdOut.putText("Renames a file.");
                        break;
                    case "ls":
                        _StdOut.putText("Lists all files on disk. Use -a to see hidden files.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellDate(args) {
            let date = new Date();
            _StdOut.putText(date.toLocaleString());
        }
        shellWhereAmI(args) {
            _StdOut.putText("Inside Your Head!");
        }
        shellBSOD(args) {
            _Kernel.krnTrapError("Testing from command line!");
        }
        shellRandomQuote(args) {
            let quotes = [
                "Do...or do not...there is no try - Yoda",
                "You must do what you feel is right, of course - Obi Wan Kenobi",
                "Apology accepted, Captain Needa - Darth Vader",
                "Don't take any shit from anybody - Billy Joel",
                "Is there anybody alive out there? - Bruce Springsteen"
            ];
            _StdOut.putText(quotes[Math.floor(Math.random() * quotes.length)]);
        }
        shellLoad(args) {
            let textArea = document.getElementById("taProgramInput");
            // I found this regular expression to test for hex characters here: https://stackoverflow.com/a/5317339
            let regex = new RegExp("^[0-9A-F, ]+$");
            // Using JSON.stringify to get the raw value including the new line and other symbols
            let value = JSON.stringify(textArea.value.trim());
            if (value.length > 0) {
                value = value.substring(1, value.length - 1).replaceAll("\\n", " ").replaceAll("\\r", " "); // remove the leading and trailing quotes that come from the stringify function, and replace the carriage returns
                if (regex.test(value)) {
                    let program = value.split(" ");
                    // Check if the program is within the size of a segment.
                    if (program.length <= 256) {
                        _Kernel.krnInitProcess(program);
                    }
                    else {
                        _StdOut.putText("The user program is too long.");
                    }
                }
                else {
                    _StdOut.putText("The user program is invalid.");
                }
            }
        }
        shellRun(args) {
            if (args.length > 0) {
                let pid = parseInt(args[0]);
                _Kernel.singleRun = true; // set this flag to let the program know we only want to run one program.
                _Kernel.krnRunProcess(pid);
            }
            else {
                _StdOut.putText("Error: please specify a PID");
            }
        }
        shellStatus(args) {
            if (args.length > 0) {
                let statusMessage = "";
                for (let i in args) {
                    statusMessage += args[i] + " ";
                }
                document.getElementById("status-message").innerHTML = statusMessage;
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        }
        shellClearMemory(args) {
            _Kernel.krnClearMemory(); // Makes a kernel call to clear the memory
        }
        shellRunAll(args) {
            for (let i = 0; i < _PCBList.length; i++) {
                let pcb = _PCBList[i];
                if (pcb.state === TSOS.State.RESIDENT) {
                    pcb.state = TSOS.State.READY;
                    if (!_PCBQueue.q.includes(pcb)) {
                        _PCBQueue.enqueue(pcb);
                    }
                }
            }
            if (_PCBQueue.getSize() > 0) {
                let pcb = _PCBQueue.head();
                _Kernel.singleRun = false; // set this flag to let the program know we only want to run multiple programs.
                if (pcb.state === TSOS.State.READY) {
                    pcb = _PCBQueue.dequeue(); // remove the first one so we can requeue it at the end.
                    _Kernel.krnRunProcess(pcb.pid);
                }
            }
            else {
                _StdOut.putText("There are no programs in the queue.");
            }
        }
        shellPS(args) {
            if (_PCBList.length == 0) {
                _StdOut.putText("No processes have been run.");
            }
            for (let i = 0; i < _PCBList.length; i++) {
                let pcb = _PCBList[i];
                _StdOut.putText(`PID: ${pcb.pid}`);
                _StdOut.advanceLine();
                _StdOut.putText(`State: ${pcb.state}`);
                _StdOut.advanceLine();
                _StdOut.putText(`Segment: ${pcb.segment}`);
                _StdOut.advanceLine();
                _StdOut.advanceLine();
            }
        }
        shellKill(args) {
            if (args.length > 0) {
                let pid = parseInt(args[0]);
                for (let i = 0; i < _PCBList.length; i++) {
                    if (pid == _PCBList[i].pid) {
                        _Kernel.krnTerminateProcess(_PCBList[i]);
                        _StdOut.advanceLine();
                        _StdOut.putText(`Killed process with PID ${pid}.`);
                        _StdOut.advanceLine();
                        _OsShell.putPrompt();
                        break;
                    }
                }
            }
            else {
                _StdOut.putText("Please specify a PID.");
            }
        }
        shellKillAll(args) {
            _Kernel.krnKillAllProcesses();
        }
        shellQuantum(args) {
            if (args.length > 0) {
                let oldQuantum = _CpuScheduler.quantum;
                let newQuantum = parseInt(args[0]);
                _CpuScheduler.quantum = newQuantum;
                _StdOut.putText(`Quantum changed from ${oldQuantum} to ${newQuantum}.`);
            }
            else {
                _StdOut.putText("Please specify a new quantum.");
            }
        }
        // Disk commands
        shellFormat(args) {
            if (args.length > 0) {
                switch (args[0]) {
                    case "-quick": {
                        _Kernel.krnFormatDisk(true);
                        break;
                    }
                    case "-full": {
                        _Kernel.krnFormatDisk(false);
                        break;
                    }
                }
            }
            else {
                _Kernel.krnFormatDisk(false); // This is for glados testing - format doesn't have any parameters. 
            }
        }
        shellCreate(args) {
            if (args.length > 0) {
                _Kernel.krnCreateFile(args[0]);
            }
            else {
                _StdOut.putText("Usage: create <filename>  Please supply a file name.");
            }
        }
        shellRead(args) {
            if (args.length > 0) {
                let filename = args[0];
                _Kernel.krnReadFile(filename);
            }
            else {
                _StdOut.putText("Usage: read <filename>  Please supply a file name.");
            }
        }
        shellWrite(args) {
            if (args.length > 0) {
                let filename = args[0];
                let contents = args.slice(1).join(" "); // Splice accounts for spaces inside the quotes.
                if (!contents.startsWith("\"") && !contents.endsWith("\"")) {
                    _StdOut.putText("Please put the contents in quotes.");
                }
                else {
                    contents = contents.slice(1, -1); // slice gets rid of the quotes.
                    _Kernel.krnWriteFile(filename, contents);
                }
            }
            else {
                _StdOut.putText("Usage: write <filename> \"data\" Please supply a file name and/or data.");
            }
        }
        shellDelete(args) {
            if (args.length > 0) {
                let filename = args[0];
                _Kernel.krnDeleteFile(filename);
            }
            else {
                _StdOut.putText("Usage: delete <filename>  Please supply a file name.");
            }
        }
        shellCopy(args) {
            if (args.length > 0) {
                let filename = args[0];
                if (args.length > 1) {
                    let newFilename = args[1];
                    _Kernel.krnCopyFile(filename, newFilename);
                }
                else {
                    _StdOut.putText("Please supply a filename to copy to.");
                }
            }
            else {
                _StdOut.putText("Usage: copy <existing filename> <new filename> Please supply a file name.");
            }
        }
        shellRename(args) {
            if (args.length > 0) {
                let currentFilename = args[0];
                let newFilename = args[1];
                _Kernel.krnRenameFile(currentFilename, newFilename);
            }
            else {
                _StdOut.putText("Usage: rename <existing filename> <new filename> Please supply a file name.");
            }
        }
        shellLs(args) {
            if (args.length > 0) {
                if (args[0] == '-a') {
                    // List all files, including hidden ones
                    _Kernel.krnListFiles(true);
                }
            }
            else {
                _Kernel.krnListFiles(false);
            }
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map