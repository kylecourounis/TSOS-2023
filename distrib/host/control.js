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
var TSOS;
(function (TSOS) {
    class Control {
        static stepMode = false;
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            setInterval(() => {
                // Set the date and time element to a string formatted in the correct locale
                let date = new Date();
                document.getElementById("date-time").innerHTML = date.toLocaleString();
            }, 100);
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt, Reset, and step control buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnStepMode").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemAccessor = new TSOS.MemoryAccessor(_Memory);
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        static hostBtnStepMode_click(btn) {
            document.getElementById("btnNextStep").disabled = !document.getElementById("btnNextStep").disabled;
            if (!Control.stepMode) {
                Control.stepMode = true;
                document.getElementById("btnStepMode").value = "Step Mode: ON";
                _CPU.isExecuting = false;
            }
            else {
                Control.stepMode = false;
                document.getElementById("btnStepMode").value = "Step Mode: OFF";
                _CPU.isExecuting = true;
            }
        }
        static hostBtnNextStep_click(btn) {
            if (Control.stepMode) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(NEXT_STEP_IRQ, []));
            }
        }
        static initMemoryView() {
            let memoryTable = document.getElementById("memory");
            // Since you wanted rows of 8 spaces in memory
            for (let i = 0; i < _Memory.memory.length / 8; i++) {
                memoryTable.insertRow();
                let addrElement = document.createElement('td');
                addrElement.innerHTML = TSOS.Utils.toHex(i * 8, 4);
                memoryTable.rows[memoryTable.rows.length - 1].appendChild(addrElement);
                for (let j = 0; j < 8; j++) {
                    let element = document.createElement('td');
                    element.id = `mem${i * 8 + j}`;
                    element.innerHTML = TSOS.Utils.toHex(0, 2); // set all spaces to zero
                    memoryTable.rows[memoryTable.rows.length - 1].appendChild(element);
                }
            }
        }
        static updateMemoryView() {
            let memoryTable = document.getElementById("memory");
            for (let i = 0; i < _Memory.memory.length; i++) {
                let row = memoryTable.rows[i];
                for (let j = 1; j <= 8; j++) {
                    let element = document.getElementById(`mem${i * 8 + j - 1}`);
                    if (element != null) {
                        element.innerHTML = TSOS.Utils.toHex(_Memory.memory[i * 8 + j - 1], 2);
                    }
                }
            }
        }
        static updateCPUView() {
            document.getElementById("cpu-PC").innerHTML = TSOS.Utils.toHex(_CPU.PC, 2);
            document.getElementById("cpu-IR").innerHTML = TSOS.Utils.toHex(_CPU.IR, 2);
            document.getElementById("cpu-Acc").innerHTML = TSOS.Utils.toHex(_CPU.Acc, 2);
            document.getElementById("cpu-X").innerHTML = TSOS.Utils.toHex(_CPU.Xreg, 2);
            document.getElementById("cpu-Y").innerHTML = TSOS.Utils.toHex(_CPU.Yreg, 2);
            document.getElementById("cpu-Z").innerHTML = TSOS.Utils.toHex(_CPU.Zflag, 2);
        }
        static createProcessRow(pcb) {
            // Create the row for the pcb info to be placed in
            let row = document.createElement('tr');
            row.id = `pid${pcb.pid}`;
            // Create PID element
            let pidElem = document.createElement('td');
            pidElem.innerHTML = pcb.pid.toString();
            row.appendChild(pidElem);
            // Create State element
            let stateElem = document.createElement('td');
            stateElem.innerHTML = pcb.state.toString();
            row.appendChild(stateElem);
            // Create PC element
            let pcElem = document.createElement('td');
            pcElem.innerHTML = TSOS.Utils.toHex(pcb.programCounter, 2);
            row.appendChild(pcElem);
            // Create IR element
            let irElem = document.createElement('td');
            irElem.innerHTML = TSOS.Utils.toHex(pcb.instructionRegister, 2);
            row.appendChild(irElem);
            // Create Acc element
            let accElem = document.createElement('td');
            accElem.innerHTML = TSOS.Utils.toHex(pcb.acc, 2);
            row.appendChild(accElem);
            // Create X Reg element
            let xRegElem = document.createElement('td');
            xRegElem.innerHTML = TSOS.Utils.toHex(pcb.xReg, 2);
            row.appendChild(xRegElem);
            // Create Y Reg element
            let yRegElem = document.createElement('td');
            yRegElem.innerHTML = TSOS.Utils.toHex(pcb.yReg, 2);
            row.appendChild(yRegElem);
            // Create Z flag element
            let zFlagElem = document.createElement('td');
            zFlagElem.innerHTML = pcb.zFlag.toString();
            row.appendChild(zFlagElem);
            // Create segment element
            let segElem = document.createElement('td');
            segElem.innerHTML = pcb.segment.toString();
            row.appendChild(segElem);
            // Create segment element
            let locationElem = document.createElement('td');
            locationElem.innerHTML = pcb.location.toString();
            row.appendChild(locationElem);
            // Append to table
            let processes = document.querySelector('#processes');
            processes.appendChild(row);
        }
        // Function to update the table entry for the PCB
        static updatePCBRow(pcb) {
            // Get the table row
            let row = document.getElementById(`pid${pcb.pid}`);
            // Update state
            row.cells[1].innerHTML = pcb.state;
            // Update each of the CPU fields
            row.cells[2].innerHTML = TSOS.Utils.toHex(pcb.programCounter, 2);
            row.cells[3].innerHTML = TSOS.Utils.toHex(pcb.instructionRegister, 2);
            row.cells[4].innerHTML = TSOS.Utils.toHex(pcb.acc, 2);
            row.cells[5].innerHTML = TSOS.Utils.toHex(pcb.xReg, 2);
            row.cells[6].innerHTML = TSOS.Utils.toHex(pcb.yReg, 2);
            row.cells[7].innerHTML = TSOS.Utils.toHex(pcb.zFlag, 2);
            row.cells[8].innerHTML = pcb.segment.toString();
            row.cells[9].innerHTML = pcb.location.toString();
        }
        static initDiskView() {
            let diskTable = document.getElementById("disk-drive");
            if (diskTable.rows.length > 1) {
                // Reset the table
                diskTable.innerHTML = `
                                        <tr>
                                        <th>TSB</th>
                                        <th>Available</th>
                                        <th>Next Block</th>
                                        <th>Data</th>
                                        </tr>`;
            }
            for (let t = 0; t < TSOS.TRACKS; t++) {
                for (let s = 0; s < TSOS.SECTORS; s++) {
                    for (let b = 0; b < TSOS.BLOCKS; b++) {
                        let row = document.createElement('tr');
                        // Apparently query selector can't be just numbers, so I prefixed it with tsb
                        row.id = `tsb${t}${s}${b}`;
                        let tsbElement = document.createElement('td');
                        tsbElement.innerHTML = `${t}:${s}:${b}`;
                        row.appendChild(tsbElement);
                        let data = sessionStorage.getItem(`${t}:${s}:${b}`);
                        let availableElem = document.createElement('td');
                        availableElem.innerHTML = data.charAt(1);
                        row.appendChild(availableElem);
                        let nextBlockElem = document.createElement('td');
                        nextBlockElem.innerHTML = `${data.charAt(3)}:${data.charAt(5)}:${data.charAt(7)}`;
                        row.appendChild(nextBlockElem);
                        let dataElem = document.createElement('td');
                        dataElem.innerHTML = data.substring(8);
                        row.appendChild(dataElem);
                        diskTable.appendChild(row);
                    }
                }
            }
        }
        static updateDiskView() {
            for (let t = 0; t < TSOS.TRACKS; t++) {
                for (let s = 0; s < TSOS.SECTORS; s++) {
                    for (let b = 0; b < TSOS.BLOCKS; b++) {
                        let row = document.querySelector(`#tsb${t}${s}${b}`);
                        let storage = sessionStorage.getItem(`${t}:${s}:${b}`);
                        // Start at 1 to exclude first column
                        for (let i = 1; i < row.cells.length; i++) {
                            switch (i) {
                                case 1: {
                                    row.cells[i].innerHTML = storage.charAt(1);
                                    break;
                                }
                                case 2: {
                                    row.cells[i].innerHTML = storage.charAt(3) + ':' + storage.charAt(5) + ':' + storage.charAt(7);
                                    break;
                                }
                                case 3: {
                                    row.cells[i].innerHTML = storage.substring(8);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map