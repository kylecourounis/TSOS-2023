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
            _MemAccessor.readImmediate(params[0]);
            let hexVal = _MemAccessor.getMDR();
            // Increment until we reach 0x00
            let i = 0;
            while (hexVal !== 0x00) {
                let convertedChar = String.fromCharCode(hexVal);
                _StdOut.putText(convertedChar);
                i++; // increment i
                _MemAccessor.readImmediate(params[0] + i);
                hexVal = _MemAccessor.getMDR();
            }
        }
    }
    TSOS.SystemCalls = SystemCalls;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=systemCalls.js.map