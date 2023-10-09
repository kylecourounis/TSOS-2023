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

            while (hexVal !== 0x00) {
                let convertedChar = ASCII.getChar(hexVal);
                console.log(hexVal + ", " + convertedChar);
                _StdOut.putText(convertedChar);

                i++; // increment i

                _MemAccessor.readImmediate(params[0] + i);
                hexVal = _MemAccessor.getMDR();
            }
        }
    }
}
