/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        currentFont;
        currentFontSize;
        currentXPosition;
        currentYPosition;
        buffer;
        xPositions = new TSOS.Stack();
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "") {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    // Backspace
                    this.backspace();
                }
                else if (chr === String.fromCharCode(9)) {
                    // Tab
                    this.completeCommand();
                }
                else if (chr === "up" || chr === "down") {
                    // Up & Down
                    this.commandHistory(chr);
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        putText(text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Check the length of each character in the text to properly wrap the text
                for (let i = 0; i < text.length; i++) {
                    let offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text.charAt(i));
                    // Go to the next line if needed
                    if (this.currentXPosition + offset > _Canvas.width) {
                        this.xPositions.push(this.currentXPosition);
                        this.buffer += "\n";
                        this.advanceLine();
                    }
                    // Draw the character at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text.charAt(i));
                    // Move the current X position.
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        }
        completeCommand() {
            let currentTxt = this.buffer; // store whatever is currently in the buffer
            let filteredCommands = _OsShell.commandList.filter(cmd => cmd.command.startsWith(currentTxt));
            if (filteredCommands.length > 1) {
                this.advanceLine();
                for (let cmd in filteredCommands) {
                    this.putText(filteredCommands[cmd].command + " ");
                }
                this.advanceLine();
                _OsShell.putPrompt();
                this.putText(this.buffer);
            }
            else {
                while (this.backspace())
                    ; // Remove everything currently in the prompt
                let cmd = filteredCommands[0];
                this.buffer = cmd.command;
                this.putText(cmd.command);
            }
        }
        commandHistory(dir) {
            if (_OsShell.previousCommands.length > 0 && ((dir === "up" && _OsShell.previousCommandIdx > 0) || (dir === "down" && _OsShell.previousCommandIdx < _OsShell.previousCommands.length))) {
                while (this.backspace())
                    ;
                _OsShell.previousCommandIdx += (dir === "down") ? 1 : -1;
                if (dir === "down" && _OsShell.previousCommandIdx === _OsShell.previousCommands.length) {
                    this.buffer = "";
                    _OsShell.previousCommandIdx = _OsShell.previousCommands.length; // just reset this to be absolutely sure it's right and so that no indexing issues occur
                }
                else {
                    let prevCommand = _OsShell.previousCommands[_OsShell.previousCommandIdx];
                    this.buffer += prevCommand;
                    this.putText(prevCommand); // put previous command there
                }
            }
        }
        backspace() {
            if (this.buffer.length > 0) {
                // Calculate the size of the previous character
                let charSize = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.charAt(this.buffer.length - 1));
                // Draw blank rectangle at the x & y coordinates
                _DrawingContext.clearRect(this.currentXPosition - charSize, this.currentYPosition - this.currentFontSize - _FontHeightMargin, charSize, this.getLineHeight());
                // Reset X to previous position
                this.currentXPosition = this.currentXPosition - charSize;
                // Remove the character from the buffer
                this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                // Find where we wrap the line
                if (this.buffer.charAt(this.buffer.length - 1) === "\n") {
                    // Set x to end of previous line
                    this.currentXPosition = this.xPositions.pop();
                    // Move back up one line
                    this.currentYPosition -= this.getLineHeight();
                    // This removes \n
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                }
                return true;
            }
            else {
                return false;
            }
        }
        advanceLine() {
            this.currentXPosition = 0;
            // Was wondering why this wasn't working for a solid 20 minutes and then realized that I didn't put '+ this.getLineHeight()' *facepalm*
            if (this.currentYPosition + this.getLineHeight() > _Canvas.height) {
                // Get the entire canvas (minus the top line) as an image and put it in a variable
                // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
                let image = _DrawingContext.getImageData(0, this.getLineHeight(), _Canvas.width, _Canvas.height - this.getLineHeight());
                this.clearScreen(); // Clear the whole screen before we move up
                // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
                _DrawingContext.putImageData(image, 0, 0); // put the canvas content back. 
            }
            else {
                this.currentYPosition += this.getLineHeight();
            }
        }
        getLineHeight() {
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             *
             * Taken from the advanceLine() method above
             */
            return _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map