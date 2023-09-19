/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        

        constructor(public PC: number = 0,
                    public IR: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.IR = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        /**
         * Helper method to get the 2's complement of the specified number.
         * Used for the branch instruction.
         * @param hex The number to get the 2's comp of.
         * @returns The 2's comp of the specified number.
         */
        private getOffset(hex: number) {
            return 0xFF - hex + 1;
        }


        /**
         * The fetch cycle.
         */
        public fetch() {
            if (this.PC > 1) {
                this.PC++;
            }
    
            _MMU.setMAR(this.PC);
            this.IR = _MMU.read();
        }
    
        /**
         * The decode cycle.
         * @param numOperands The number of operands in this instruction.
         */
        public decode(numOperands: number) {
            if (numOperands === 1) {
                this.PC++;
        
                _MMU.setLowOrderByte(this.PC);
        
                _MMU.decodedByte1 = _MMU.read();
            } else if (numOperands === 2) {
                this.PC++;
            
                if (_MMU.decodedByte1 == null) {
                    _MMU.readImmediate(this.PC);
                    _MMU.decodedByte1 = _MMU.getMDR();
        
                    _MMU.setLowOrderByte(_MMU.decodedByte1);
                } else {
                    _MMU.readImmediate(this.PC);
                    _MMU.decodedByte2 = _MMU.getMDR();
        
                    _MMU.setHighOrderByte(_MMU.decodedByte2);
                }
            }
    
            _MMU.read();
        }
    
        /**
         * The execute cycle.
         */
        public execute() {
            switch (this.IR) {
                case OpCode.LDA_C: {
                    this.Acc = _MMU.decodedByte1;
                    break;
                }
        
                case OpCode.LDA_M: {
                    this.Acc = _MMU.getMDR();
                    break;
                }
        
                case OpCode.STA: {
                    _MMU.write(this.Acc);
                    break;
                }
        
                case OpCode.ADC: {
                    this.Acc += _MMU.read();
                    break;
                }
        
                case OpCode.LDX_C: {
                    this.Xreg = _MMU.decodedByte1;
                    break;
                }
        
                case OpCode.LDX_M: {
                    this.Xreg = _MMU.getMDR();
                    break;
                }
        
                case OpCode.LDY_C: {
                    this.Yreg = _MMU.decodedByte1;
                    break;
                }
        
                case OpCode.LDY_M: {
                    this.Yreg = _MMU.getMDR();
                    break;
                }
        
                case OpCode.TAY: {
                    this.Yreg = this.Acc;
                    break;
                }
        
                case OpCode.NOP: {
                    // No operation. Easy! :)
                    break;
                }
        
                case OpCode.BRK: {
                    this.Zflag = 10;
                    break;
                }
        
                case OpCode.CPX: {
                    if (this.Xreg == _MMU.getMDR()) {
                        this.Zflag = 0x01;
                    } else {
                        this.Zflag = 0x00;
                    }
        
                    break;
                }
        
                case OpCode.BNE: {
                    if (this.Zflag == 0x01) {
                        let offset = this.getOffset(_MMU.getMDR());
                        this.PC -= offset;
                    }
        
                    break;
                }
        
                case OpCode.INC: {
                    this.Acc = _MMU.getMDR();
                    this.Acc += 1;
                    _MMU.write(this.Acc);
        
                    break;
                }
        
                case OpCode.SYS: {
                    if (this.Xreg === 1) {
                        _StdOut.putText(this.Yreg.toString());
                    } else if (this.Xreg === 2) {
                        let data = ASCII.getChar(_MMU.decodedByte1);
                        _StdOut.putText('' + data);
                    }
        
                    break;
                }
                
                default: {
                    // Set exit flag
                    this.Zflag = 10;
                }
            }
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.isExecuting = true;

            this.fetch();

            let decodeCycles = DecodeCycles.get(this.IR);
            this.decode(decodeCycles);

            this.execute();

            this.isExecuting = false;
        }
    }
}
