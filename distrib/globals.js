/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
const APP_NAME = "CourounOS"; // 'cause Bob and I were at a loss for a better name.
const APP_VERSION = "0.4.0"; // What did you expect?
const CPU_CLOCK_INTERVAL = 50; // This is in ms (milliseconds) so 1000 = 1 second.
const TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ = 1;
const SYS_PRINT_INT = 2;
const SYS_PRINT_STR = 3;
const NEXT_STEP_IRQ = 4;
const DISPATCHER_IRQ = 5;
const MEM_ACC_VIOLATION_IRQ = 6;
const INVALID_OP_CODE_IRQ = 7;
const TERMINATE_IRQ = 8;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _Memory; // Utilize TypeScript's type annotation system to ensure that _Memory is an instance of the Memory class.
var _MemAccessor; // Utilize TypeScript's type annotation system to ensure that _MemAccessor is an instance of the MemoryAccessor class.
var _MemoryManager; // Utilize TypeScript's type annotation system to ensure that _MemoryManager is an instance of the MemoryManager class.
var _CpuDispatcher;
var _CpuScheduler;
var _Swap;
var _PCBList = [];
var _PCBQueue = null;
var _CurrentProcess = null;
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelInputQueue = null;
var _KernelBuffers = null;
// Standard input and output
var _StdIn = null;
var _StdOut = null;
// UI
var _Console;
var _OsShell;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;
var _krnDiskDriver = null;
var _hardwareClockID = null;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
var onDocumentLoad = function () {
    TSOS.DecodeCycles.initMap();
    TSOS.Control.hostInit();
};
//# sourceMappingURL=globals.js.map