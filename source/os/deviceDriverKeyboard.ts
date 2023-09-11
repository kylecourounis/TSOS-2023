/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) { 
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57))    ||   // digits
                        (keyCode == 32)                        ||   // space
                        (keyCode == 13)                        ||   // enter
                        (keyCode == 8)                         ||   // backspace
                        (keyCode == 9)                         ||   // tab
                        (keyCode == 59 || keyCode == 186)      ||   // semicolon, enter
                        (keyCode == 187 || keyCode == 188)     ||   // equal, comma
                        (keyCode == 189) || (keyCode == 190)   ||   // hyphen, period
                        (keyCode == 191) || (keyCode == 192)   ||   // slash, backtick (uptick)
                        (keyCode == 219) || (keyCode == 220)   ||   // left bracket, back slash
                        (keyCode == 221) || (keyCode == 222)        // right bracket, apostrophe
                      ) {
                if (isShifted && keyCode != 8 && keyCode != 9 && keyCode != 13) { // ignore backspace, tab, and enter keys so that it behaves like a real terminal
                    // Shifted

                    // This was a good reference - http://gcctech.org/csc/javascript/javascript_keycodes.htm
                    switch (keyCode) {
                        case 49: // 1
                            chr = "!";
                            break;
                        case 50: // 2
                            chr = "@";
                            break;
                        case 51: // 3
                            chr = "#";
                            break;
                        case 52: // 4
                            chr = "$";
                            break;
                        case 53: // 5
                            chr = "%";
                            break;
                        case 54: // 6
                            chr = "^";
                            break;
                        case 55: // 7
                            chr = "&";
                            break;
                        case 56: // 8
                            chr = "*";
                            break;
                        case 57: // 9
                            chr = "(";
                            break;
                        case 48: // 0
                            chr = ")";
                            break;
                        case 186: // ;
                            chr = ":";
                            break;
                        case 187: // =
                            chr = "+";
                            break;
                        case 188: // ,
                            chr = "<";
                            break;
                        case 189: // -
                            chr = "_";
                            break;
                        case 190: // .
                            chr = ">";
                            break;
                        case 191: // /
                            chr = "?";
                            break;
                        case 192: // `
                            chr = "~";
                            break;
                        case 219: // [
                            chr = "{";
                            break;
                        case 220: // \
                            chr = "|";
                            break;
                        case 221: // ]
                            chr = "}";
                            break;
                        case 222: // '
                            chr = '"';
                            break;
                    }
                } else {
                    // Unshifted
                    switch (keyCode) {
                        case 186: // ;
                            chr = ";";
                            break;
                        case 187: // =
                            chr = "=";
                            break;
                        case 188: // ,
                            chr = ",";
                            break;
                        case 189: // -
                            chr = "-";
                            break;
                        case 190: // .
                            chr = ".";
                            break;
                        case 191: // /
                            chr = "/";
                            break;
                        case 192: // `
                            chr = "`";
                            break;
                        case 219: // [
                            chr = "[";
                            break;
                        case 220: // \
                            chr = "\\";
                            break;
                        case 221: // ]
                            chr = "]";
                            break;
                        case 222: // '
                            chr = "\'";
                            break;
                        default:
                            // The rest or the ascii codes match the key code
                            chr = String.fromCharCode(keyCode);
                    }
                }
                
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode == 38) || (keyCode == 40)) { // up & down
                /* 
                 * It's good thing that I implemented the command history before doing the symbols part, because otherwise, 
                 * I would have never noticed that the behavior of the ampersand was mimicking the up arrow and the open parenthesis didn't work
                 * I would have never realized to do this otherwise.
                 */
                if (keyCode == 38) {
                    _KernelInputQueue.enqueue("up");
                } else if (keyCode == 40) {
                    _KernelInputQueue.enqueue("down");
                }
            }
        }
    }
}
