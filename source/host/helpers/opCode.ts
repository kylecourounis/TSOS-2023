module TSOS {
    export enum OpCode {
        LDA_C = 0xA9,
        LDA_M = 0xAD,
      
        STA = 0x8D,
        
        ADC = 0x6D,
      
        LDX_C = 0xA2,
        LDX_M = 0xAE,
      
        LDY_C = 0xA0,
        LDY_M = 0xAC,
      
        NOP = 0xEA,
        BRK = 0x00, 
      
        CPX = 0xEC,
        BNE = 0xD0,
      
        INC = 0xEE,
      
        SYS = 0xFF,
    }
      
    export class DecodeCycles {
        private static map: Map<OpCode, number>;
    
        /**
         * Initializes the map that ties the OpCode to the number of decode cycles required for that instruction.
         */
        public static initMap() {
            DecodeCycles.map = new Map<OpCode, number>();
        
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
        public static get(opCode: OpCode): number {
            return DecodeCycles.map.get(opCode);
        }
    }
}