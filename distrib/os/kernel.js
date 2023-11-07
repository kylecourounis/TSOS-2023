/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Kernel {
        singleRun;
        //
        // OS Startup and Shutdown Routines
        //
        krnBootstrap() {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            _PCBQueue = new TSOS.Queue(); // The process control block queue
            _MemoryManager = new TSOS.MemoryManager(); // The memory manager
            _CpuScheduler = new TSOS.CpuScheduler();
            _CpuDispatcher = new TSOS.CpuDispatcher();
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            TSOS.Control.initMemoryView();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            //
            // ... more?
            //
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }
        krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // Set each process to a terminated state
            _PCBList.forEach(pcb => {
                if (pcb.state === TSOS.State.RUNNING) {
                    pcb.state = TSOS.State.TERMINATED;
                    TSOS.Control.updatePCBRow(pcb);
                }
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
        krnOnCPUClockPulse() {
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
            }
            else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed. 
                // This flag is to determine whether run or runall was used.
                if (!this.singleRun) {
                    _CpuScheduler.schedule();
                }
                _CPU.cycle();
                _CurrentProcess.updateFromCPU(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                TSOS.Control.updatePCBRow(_CurrentProcess); // Update the visual
            }
            else { // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
                _CurrentProcess = null; // This is so the memory accessor doesn't throw a violation when we want to load new programs after they're finished executing.
            }
            // _MemoryManager.deallocateTerminatedProcesses(); // this is a good check
        }
        //
        // Initialize a process
        //
        krnInitProcess(program, baseAddr = 0) {
            let pcb = new TSOS.PCB();
            pcb.state = TSOS.State.READY;
            let success = _MemoryManager.allocateMemoryForProgram(pcb, program);
            if (success) {
                TSOS.PCB.pidStore++; // Increment PID counter only if we successfully create it
                _PCBList.push(pcb); // This is what we're actually using for the moment
                _PCBQueue.enqueue(pcb); // This is WIP
                _StdOut.putText(`\nCreated process with PID ${pcb.pid}`);
                TSOS.Control.createProcessRow(pcb);
                TSOS.Control.updateMemoryView();
            }
            else {
                _StdOut.putText("You cannot load any more programs - memory is full.");
            }
        }
        krnRunProcess(pid) {
            let pcb = _PCBList[pid];
            if (pcb) {
                if (pcb.state === TSOS.State.READY) {
                    _CPU.init(); // Reset the CPU values before we run the application
                    pcb.state = TSOS.State.RUNNING;
                    _CurrentProcess = pcb;
                    TSOS.Control.updatePCBRow(pcb);
                    // If we're not in step mode, proceed with execution normally
                    if (!TSOS.Control.stepMode) {
                        _CPU.isExecuting = true;
                    }
                }
                else if (pcb.state === TSOS.State.TERMINATED) {
                    _StdOut.putText("Error: unable to start process with PID that has already executed."); // since we don't remove things from the PCBList (this is to keep it properly indexed), we need to tell the user that they can't run a process with the same PID again.
                }
            }
            else {
                _StdOut.putText("Unknown PID.");
            }
        }
        krnTerminateProcess(pcb) {
            pcb.state = TSOS.State.TERMINATED; // Set the state of the PCB to terminated
            TSOS.Control.updatePCBRow(pcb);
            _MemoryManager.deallocateMemory(pcb);
        }
        krnKillAllProcesses() {
            _CPU.isExecuting = false;
            for (let i in _PCBQueue.q) {
                let pcb = _PCBQueue.q[i];
                this.krnTerminateProcess(pcb);
            }
            _CPU.init();
        }
        krnClearMemory() {
            if (_CPU.isExecuting) {
                _StdOut.putText("Unable to clear memory while the CPU is executing!");
            }
            else {
                _Memory.clearMemory(0, TSOS.Memory.SIZE); // clears the entire memory
                _PCBQueue.clear();
            }
        }
        //
        // Interrupt Handling
        //
        krnEnableInterrupts() {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }
        krnDisableInterrupts() {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }
        krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SYS_PRINT_INT:
                    TSOS.SystemCalls.printInt(params);
                    break;
                case SYS_PRINT_STR:
                    TSOS.SystemCalls.printString(params);
                    break;
                case NEXT_STEP_IRQ:
                    TSOS.InterruptRoutines.step();
                    break;
                case DISPATCHER_IRQ:
                    TSOS.InterruptRoutines.triggerContextSwitch();
                    break;
                case MEM_ACC_VIOLATION_IRQ:
                    _StdOut.putText(`Memory access violation in segment ${params[0]} at ${TSOS.Utils.toHex(params[1], 4)}!`);
                    this.krnTerminateProcess(_CurrentProcess);
                    break;
                case INVALID_OP_CODE_IRQ:
                    _StdOut.putText(`Invalid opcode: ${TSOS.Utils.toHex(params[1], 2)} at ${TSOS.Utils.toHex(params[0], 4)}`);
                    this.krnTerminateProcess(_CurrentProcess);
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }
        krnTimerISR() {
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
        krnTrace(msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        }
        krnTrapError(msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            _Console.clearScreen(); // clear the screen
            _Canvas.style.backgroundColor = "blue";
            _OsShell.promptStr = ""; // take away the prompt symbol - we no longer accept input because the interrupts are cancelled and it covers part of the message sometimes
            _DrawingContext.drawText(_Console.currentFont, _Console.currentFontSize, 0, 15, "ERROR!");
            _DrawingContext.drawText(_Console.currentFont, _Console.currentFontSize, 0, 40, msg);
            this.krnShutdown();
        }
    }
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=kernel.js.map