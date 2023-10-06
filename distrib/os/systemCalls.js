/* ------------
   SystemCalls.ts
------------ */
var TSOS;
(function (TSOS) {
    class SystemCalls {
        static printInt(params) {
            _StdOut.putText(params[0]);
        }
        static printString(params) {
            _MMU.readImmediate(params[0]);
            let hexVal = _MMU.getMDR();
            // Increment until we reach 0x00
            let i = 0;
            while (hexVal !== 0x00) {
                let convertedChar = TSOS.ASCII.getChar(hexVal);
                _StdOut.putText(convertedChar);
                i++; // increment i
                _MMU.readImmediate(params[0] + i);
                hexVal = _MMU.getMDR();
            }
        }
    }
    TSOS.SystemCalls = SystemCalls;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=systemCalls.js.map