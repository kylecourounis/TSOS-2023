var TSOS;
(function (TSOS) {
    let OpCode;
    (function (OpCode) {
        OpCode[OpCode["LDA_C"] = 169] = "LDA_C";
        OpCode[OpCode["LDA_M"] = 173] = "LDA_M";
        OpCode[OpCode["STA"] = 141] = "STA";
        OpCode[OpCode["ADC"] = 109] = "ADC";
        OpCode[OpCode["LDX_C"] = 162] = "LDX_C";
        OpCode[OpCode["LDX_M"] = 174] = "LDX_M";
        OpCode[OpCode["LDY_C"] = 160] = "LDY_C";
        OpCode[OpCode["LDY_M"] = 172] = "LDY_M";
        OpCode[OpCode["NOP"] = 234] = "NOP";
        OpCode[OpCode["BRK"] = 0] = "BRK";
        OpCode[OpCode["CPX"] = 236] = "CPX";
        OpCode[OpCode["BNE"] = 208] = "BNE";
        OpCode[OpCode["INC"] = 238] = "INC";
        OpCode[OpCode["SYS"] = 255] = "SYS";
    })(OpCode = TSOS.OpCode || (TSOS.OpCode = {}));
    class DecodeCycles {
        static map;
        /**
         * Initializes the map that ties the OpCode to the number of decode cycles required for that instruction.
         */
        static initMap() {
            DecodeCycles.map = new Map();
            DecodeCycles.map.set(OpCode.LDA_C, 1);
            DecodeCycles.map.set(OpCode.LDA_M, 2);
            DecodeCycles.map.set(OpCode.STA, 2);
            DecodeCycles.map.set(OpCode.ADC, 2);
            DecodeCycles.map.set(OpCode.LDX_C, 1);
            DecodeCycles.map.set(OpCode.LDX_M, 2);
            DecodeCycles.map.set(OpCode.LDY_C, 1);
            DecodeCycles.map.set(OpCode.LDY_M, 2);
            DecodeCycles.map.set(OpCode.NOP, 0);
            DecodeCycles.map.set(OpCode.BRK, 0);
            DecodeCycles.map.set(OpCode.CPX, 2);
            DecodeCycles.map.set(OpCode.BNE, 1);
            DecodeCycles.map.set(OpCode.INC, 2);
            DecodeCycles.map.set(OpCode.SYS, 0);
        }
        /**
         * Gets the number of decode cycles associated with the specified OpCode.
         * @param opCode The OpCode
         * @returns The number of cycles associated with the OpCode.
         */
        static get(opCode) {
            return DecodeCycles.map.get(opCode);
        }
    }
    TSOS.DecodeCycles = DecodeCycles;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=opCode.js.map