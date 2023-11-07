/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {
        public static stepMode: boolean = false;

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            setInterval(() => {
                // Set the date and time element to a string formatted in the correct locale
                let date = new Date();
                (<HTMLSpanElement>document.getElementById("date-time")).innerHTML = date.toLocaleString();
            }, 100);

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt, Reset, and step control buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnStepMode")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            _Memory = new Memory();
            _Memory.init();

            _MemAccessor = new MemoryAccessor(_Memory);

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnStepMode_click(btn): void {
            (<HTMLButtonElement>document.getElementById("btnNextStep")).disabled = !(<HTMLButtonElement>document.getElementById("btnNextStep")).disabled;

            if (!Control.stepMode) {
                Control.stepMode = true;

                (<HTMLButtonElement>document.getElementById("btnStepMode")).value = "Step Mode: ON";

                _CPU.isExecuting = false;
            } else {
                Control.stepMode = false;

                (<HTMLButtonElement>document.getElementById("btnStepMode")).value = "Step Mode: OFF";

                _CPU.isExecuting = true;
            }
        }

        public static hostBtnNextStep_click(btn): void {
            if (Control.stepMode) {
                _KernelInterruptQueue.enqueue(new Interrupt(NEXT_STEP_IRQ, []));
            }
        }

        public static initMemoryView(): void {
            let memoryTable = (<HTMLTableElement> document.getElementById("memory"));

            // Since you wanted rows of 8 spaces in memory
            for (let i = 0; i < _Memory.memory.length / 8; i++) {
                memoryTable.insertRow();

                let addrElement: HTMLTableCellElement = document.createElement('td');

                addrElement.innerHTML = Utils.toHex(i * 8, 4);
                memoryTable.rows[memoryTable.rows.length - 1].appendChild(addrElement);

                for (let j = 0; j < 8; j++) {
                    let element: HTMLTableCellElement = document.createElement('td');
                    element.id = `mem${i * 8 + j}`;
                    element.innerHTML = Utils.toHex(0, 2); // set all spaces to zero
                    memoryTable.rows[memoryTable.rows.length - 1].appendChild(element);
                }
            }
        }

        public static updateMemoryView(): void {
            let memoryTable = (<HTMLTableElement> document.getElementById("memory"));

            for (let i = 0; i < _Memory.memory.length; i++) {
                let row: HTMLTableRowElement = memoryTable.rows[i];

                for (let j = 1; j <= 8; j++) {
                    let element = document.getElementById(`mem${i * 8 + j - 1}`);

                    if (element != null) {
                        element.innerHTML = Utils.toHex(_Memory.memory[i * 8 + j - 1], 2);
                    }
                }
            }
        }

        public static updateCPUView(): void {
            document.getElementById("cpu-PC").innerHTML = Utils.toHex(_CPU.PC, 2);
            document.getElementById("cpu-IR").innerHTML = Utils.toHex(_CPU.IR, 2);
            document.getElementById("cpu-Acc").innerHTML = Utils.toHex(_CPU.Acc, 2);
            document.getElementById("cpu-X").innerHTML = Utils.toHex(_CPU.Xreg, 2);
            document.getElementById("cpu-Y").innerHTML = Utils.toHex(_CPU.Yreg, 2);
            document.getElementById("cpu-Z").innerHTML = Utils.toHex(_CPU.Zflag, 2);
        }

        public static createProcessRow(pcb: PCB): void {
            // Create the row for the pcb info to be placed in
            let row: HTMLTableRowElement = document.createElement('tr');
            row.id = `pid${pcb.pid}`;

            // Create PID element
            let pidElem: HTMLTableCellElement = document.createElement('td');
            pidElem.innerHTML = pcb.pid.toString();
            row.appendChild(pidElem);

            // Create State element
            let stateElem: HTMLTableCellElement = document.createElement('td');
            stateElem.innerHTML = pcb.state.toString();
            row.appendChild(stateElem);

            // Create PC element
            let pcElem: HTMLTableCellElement = document.createElement('td');
            pcElem.innerHTML = Utils.toHex(pcb.programCounter, 2);
            row.appendChild(pcElem);

            // Create IR element
            let irElem: HTMLTableCellElement = document.createElement('td');
            irElem.innerHTML = Utils.toHex(pcb.instructionRegister, 2);
            row.appendChild(irElem);

            // Create Acc element
            let accElem: HTMLTableCellElement = document.createElement('td');
            accElem.innerHTML = Utils.toHex(pcb.acc, 2);
            row.appendChild(accElem);

            // Create X Reg element
            let xRegElem: HTMLTableCellElement = document.createElement('td');
            xRegElem.innerHTML = Utils.toHex(pcb.xReg, 2);
            row.appendChild(xRegElem);

            // Create Y Reg element
            let yRegElem: HTMLTableCellElement = document.createElement('td');
            yRegElem.innerHTML = Utils.toHex(pcb.yReg, 2);
            row.appendChild(yRegElem);

            // Create Z flag element
            let zFlagElem: HTMLTableCellElement = document.createElement('td');
            zFlagElem.innerHTML = pcb.zFlag.toString();
            row.appendChild(zFlagElem);

            // Append to table
            let processes = <HTMLTableElement>document.querySelector('#processes');
            processes.appendChild(row);
        }

        // Function to update the table entry for the PCB
        public static updatePCBRow(pcb: PCB): void {
            // Get the table row
            let row: HTMLTableRowElement = <HTMLTableRowElement>document.getElementById(`pid${pcb.pid}`);

            // Update state
            row.cells[1].innerHTML = pcb.state;

            // Update each of the CPU fields
            row.cells[2].innerHTML = Utils.toHex(pcb.programCounter, 2);
            row.cells[3].innerHTML = Utils.toHex(pcb.instructionRegister, 2);
            row.cells[4].innerHTML = Utils.toHex(pcb.acc, 2);
            row.cells[5].innerHTML = Utils.toHex(pcb.xReg, 2);
            row.cells[6].innerHTML = Utils.toHex(pcb.yReg, 2);
            row.cells[7].innerHTML = Utils.toHex(pcb.zFlag, 2);
            row.cells[8].innerHTML = Utils.toHex(pcb.segment, 2);
        }
    }
}
