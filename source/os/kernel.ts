/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        public singleRun: boolean;

        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            _PCBQueue = new Queue(); // The process control block queue
            _MemoryManager = new MemoryManager(); // The memory manager

            _CpuScheduler = new CpuScheduler();
            _CpuDispatcher = new CpuDispatcher();

            // Initialize the console.
            _Console = new Console();             // The command line interface / console I/O device.
            _Console.init();

            Control.initMemoryView();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the Disk Device Driver
            this.krnTrace("Loading the disk device driver.");
            _krnDiskDriver = new DeviceDriverDisk();     // Construct it.
            _krnDiskDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnDiskDriver.status);

            //
            // ... more?
            //

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");

            _PCBQueue.clear();
            _CurrentProcess = null;

            // Set each process to a terminated state
            _PCBList.forEach(pcb => {
                this.krnTerminateProcess(pcb);
            });

            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                          
            */

            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed. 
                // This flag is to determine whether run or runall was used.
                if (!this.singleRun) {
                    _CpuScheduler.schedule();
                }
                
                if (_CurrentProcess) {
                    _CurrentProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                    Control.updatePCBRow(_CurrentProcess); // Update the visual

                    _CPU.cycle();
                }
            } else {                       // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");

                if (!Control.stepMode) {
                    _CurrentProcess = null; // This is so the memory accessor doesn't throw a violation when we want to load new programs after they're finished executing.
                }
            }
            
            _MemoryManager.deallocateTerminatedProcesses(); // this is a good check
        }

        //
        // Initialize a process
        //
        public krnInitProcess(program: string[], baseAddr: number = 0) {
            let pcb = new PCB();

            pcb.state = State.RESIDENT;

            let success = _MemoryManager.allocateMemoryForProgram(pcb, program);

            if (success) {
                PCB.pidStore++; // Increment PID counter only if we successfully create it

                _PCBList.push(pcb); // This is what we're actually using for the moment
    
                _StdOut.putText(`\nCreated process with PID ${pcb.pid}`);
    
                Control.createProcessRow(pcb);
    
                Control.updateMemoryView();
            } else {
                _StdOut.putText("You cannot load any more programs - memory is full.");
            }
        }

        public krnRunProcess(pid: number) {
            let pcb = <PCB>_PCBList[pid];

            if (pcb) {
                if (pcb.state === State.RESIDENT || pcb.state === State.READY) {
                    _CPU.init(); // Reset the CPU values before we run the application
                    
                    pcb.state = State.RUNNING;
    
                    _CurrentProcess = pcb;

                    Control.updatePCBRow(pcb);
    
                    // If we're not in step mode, proceed with execution normally
                    if (!Control.stepMode) {
                        _CPU.isExecuting = true;
                    }
                } else if (pcb.state === State.TERMINATED) {
                    _StdOut.putText("Error: unable to start process with PID that has already executed."); // since we don't remove things from the PCBList (this is to keep it properly indexed), we need to tell the user that they can't run a process with the same PID again.
                }
            } else {
                _StdOut.putText("Unknown PID.");
            }
        }

        public krnTerminateProcess(pcb: PCB) {
            if (_CurrentProcess !== null) {
                if (_CurrentProcess.pid === pcb.pid) {
                    _CpuScheduler.cycleCount = 0; 

                    _CurrentProcess = null;
                    _CPU.init();

                    _PCBQueue.remove(pcb);
                } else {
                    // Find the process that needs to be terminated
                    for (let i = 0; i < _PCBQueue.getSize(); i++) {
                        let process: PCB = _PCBQueue.dequeue();

                        if (process.pid !== pcb.pid) {
                            _PCBQueue.enqueue(process);
                        }
                    }
                }
            }

            if (pcb) {
                pcb.state = State.TERMINATED; // Set the state of the PCB to terminated
                
                Control.updatePCBRow(pcb);
    
                _MemoryManager.deallocateMemory(pcb);
            }

            if (this.singleRun) {
                _CPU.isExecuting = false;
            }
        }

        public krnKillAllProcesses() {
            _CPU.isExecuting = false;

            if (_PCBQueue.getSize() > 0) {
                for (let i in _PCBList) {
                    let pcb = _PCBList[i];

                    if (pcb.state !== State.TERMINATED) {
                        this.krnTerminateProcess(pcb);
                    }
                }

                _StdOut.putText("Terminated all running processes.");
                _StdOut.advanceLine();
            } else {
                _StdOut.putText("No processes to terminate.");
                _StdOut.advanceLine();
            }

            _CPU.init();
        }

        public krnClearMemory() {
            if (_CPU.isExecuting) {
                _StdOut.putText("Unable to clear memory while the CPU is executing!");
            } else {
                _Memory.clearMemory(0, Memory.SIZE); // clears the entire memory

                _MemoryManager.deallocateTerminatedProcesses(); // Just in case it hasn't been run on the clock pulse

                _PCBQueue.clear();

                _StdOut.putText("Cleared memory.");
                _StdOut.advanceLine();
            }
        }

        public krnFormatDisk(quick: boolean): void {
            let files = _krnDiskDriver.listFiles();
            
            if (files !== null && files.find(file => file.name.endsWith(".swap"))) {
                // Cannot format if there are swap files on the disk
                _StdOut.putText('Disk cannot be formatted while there are swap files present!');
            } else {
                _krnDiskDriver.formatDisk(quick);

                _StdOut.putText('Disk has been formatted.');
                this.krnTrace('Disk formatted');
            }
        }

        public krnListFiles(showAll: boolean): void {
            let files = _krnDiskDriver.listFiles();

            // Do a null check to see if we've formatted
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
    
                    // The format of the string to print
                    let printString = file.name + `, date created: ${file.dateCreated}`;

                    // Check our special file types
                    if (file.name.startsWith(".") || file.name.endsWith(".swap")) {
                        if (showAll) {
                            _StdOut.putText(printString);
                            _StdOut.advanceLine();
                        } else {
                            continue;
                        }
                    } else {
                        _StdOut.putText(printString);
                        _StdOut.advanceLine();
                    }
                }
            } else {
                _StdOut.putText(`The disk must be formatted before you can list the files on it.`);
            }
        }

        public krnCreateFile(filename: string): void {
            let status = _krnDiskDriver.createFile(filename);
            
            switch (status) {
                case FileStatus.SUCCESS: {
                    _StdOut.putText(`Created file '${filename}'.`);
                    break;
                }

                case FileStatus.DISK_NOT_FORMATTED: {
                    _StdOut.putText(`The disk must be formatted before you can write files.`);
                    break;
                }

                case FileStatus.NO_DATA_BLOCKS: {
                    _StdOut.putText(`Inadequate number of available blocks to to write the file.`);
                    break;
                }

                case FileStatus.NO_DIRECTORY_SPACE: {
                    _StdOut.putText(`Inadequate directory space to write the file.`);
                    break;
                }
            
                case FileStatus.FILE_EXISTS: {
                    _StdOut.putText(`A file with that name already exists!`);
                    break;
                }

                default: {
                    _StdOut.putText(`An unknown error occured while creating the file.`);
                    break;
                }
            }
        }

        public krnReadFile(filename: string): void {
            let output = _krnDiskDriver.readFile(filename);
            
            switch (output) {
                case FileStatus.DISK_NOT_FORMATTED: {
                    _StdOut.putText(`The disk must be formatted before you can write to any file.`);
                    break;
                }

                case FileStatus.FILE_NOT_FOUND: {
                    _StdOut.putText(`File not found.`);
                    break;
                }

                case FileStatus.READ_FROM_AVAILABLE_BLOCK: {
                    _StdOut.putText(`Error: trying to read data from an available block.`);
                    break;
                }

                case FileStatus.INVALID_BLOCK: {
                    _StdOut.putText(`Error: trying to read from an invalid block.`);
                    break;
                }

                default: {
                    _StdOut.putText(output);
                    break;
                }
            }
        }

        public krnWriteFile(filename: string, contents: string, raw: boolean = false): void {
            let status = _krnDiskDriver.writeFile(filename, contents, raw);
            
            switch (status) {
                case FileStatus.SUCCESS: {
                    _StdOut.putText(`Wrote '${contents}' to file '${filename}'.`);
                    break;
                }

                case FileStatus.DISK_NOT_FORMATTED: {
                    _StdOut.putText(`The disk must be formatted before you can write to any file.`);
                    break;
                }

                case FileStatus.FILE_NOT_FOUND: {
                    _StdOut.putText(`File not found.`);
                    break;
                }

                case FileStatus.INVALID_BLOCK: {
                    _StdOut.putText(`Block is not available.`);
                    break;
                }
                
                default: {
                    _StdOut.putText(`An unknown error occured while writing the file.`);
                    break;
                }
            }
        }


        public krnRenameFile(currentFilename: string, newFilename: string): void {
            let status = _krnDiskDriver.renameFile(currentFilename, newFilename);
            
            switch (status) {
                case FileStatus.SUCCESS: {
                    _StdOut.putText(`Successfully renamed '${currentFilename}' to file '${newFilename}'.`);
                    break;
                }

                case FileStatus.DISK_NOT_FORMATTED: {
                    _StdOut.putText(`The disk must be formatted before you can rename any files.`);
                    break;
                }

                case FileStatus.FILE_NOT_FOUND: {
                    _StdOut.putText(`File with name '${currentFilename}' not found.`);
                    break;
                }

                case FileStatus.DUPLICATE_NAME: {
                    _StdOut.putText(`A file with the name '${newFilename}' already exists.`);
                    break;
                }

                default: {
                    _StdOut.putText(`An unknown error occured while writing the file.`);
                    break;
                }
            }
        }
        
        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();               // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SYS_PRINT_INT:
                    SystemCalls.printInt(params);
                    break;
                case SYS_PRINT_STR:
                    SystemCalls.printString(params);
                    break;
                case NEXT_STEP_IRQ:
                    InterruptRoutines.step();
                    break;
                case DISPATCHER_IRQ:
                    InterruptRoutines.triggerContextSwitch();
                    break;
                case MEM_ACC_VIOLATION_IRQ:
                    // This will show twice for both the read and the write
                    _StdOut.putText(`Memory access violation in segment ${params[0]} at ${Utils.toHex(params[1], 4)}!`);
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();

                    this.krnTerminateProcess(_CurrentProcess);
                    
                    break;
                case INVALID_OP_CODE_IRQ:
                    _StdOut.putText(`Invalid opcode: ${Utils.toHex(params[1], 2)} at ${Utils.toHex(params[0], 4)}`);
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    
                    this.krnTerminateProcess(_CurrentProcess);

                    break;
                case TERMINATE_IRQ:
                    this.krnTerminateProcess(params[0]);
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);

            _Console.clearScreen(); // clear the screen

            _Canvas.style.backgroundColor = "blue";
            
            _OsShell.promptStr = ""; // take away the prompt symbol - we no longer accept input because the interrupts are cancelled and it covers part of the message sometimes

            _DrawingContext.drawText(_Console.currentFont, _Console.currentFontSize, 0, 15, "ERROR!"); 
            _DrawingContext.drawText(_Console.currentFont, _Console.currentFontSize, 0, 40, msg); 

            this.krnShutdown();
        }
    }
}
