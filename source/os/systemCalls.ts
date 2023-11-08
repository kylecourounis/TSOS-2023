/* ------------
   SystemCalls.ts
------------ */
module TSOS {
    export class SystemCalls {
        public static printInt(params) {
            _StdOut.putText(params[0]);
        }

        public static printString(params) {
            _MemAccessor.readImmediate(params[0]);
            let hexVal: number = _MemAccessor.getMDR();
            
            // Increment until we reach 0x00
            let i: number = 0;

            // Loop until we reach the terminator
            while (hexVal !== 0x00) {
                let convertedChar = String.fromCharCode(hexVal);
                _StdOut.putText(convertedChar);
                    
                i++; // increment i

                _MemAccessor.readImmediate(params[0] + i);
                hexVal = _MemAccessor.getMDR();
            }
        }
    }
}
