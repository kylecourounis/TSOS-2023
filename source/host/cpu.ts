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
         * The fetch cycle.
         */
        public fetch() {
            if (this.PC > 0) {
                this.PC++;
            }
    
            _MemAccessor.setMAR(this.PC);
            this.IR = _MemAccessor.read();
        }
    
        /**
         * The decode cycle.
         * @param numOperands The number of operands in this instruction.
         */
        public decode(numOperands: number) {
            if (numOperands === 1) {
                this.PC++;

                _MemAccessor.setLowOrderByte(this.PC);
        
                _MemAccessor.decodedByte1 = _MemAccessor.read();
            } else if (numOperands === 2) {
                _MemAccessor.readImmediate(this.PC + 1);
                _MemAccessor.decodedByte1 = _MemAccessor.getMDR();
    
                _MemAccessor.setLowOrderByte(_MemAccessor.decodedByte1);

                // ------------------

                _MemAccessor.readImmediate(this.PC + 2);
                _MemAccessor.decodedByte2 = _MemAccessor.getMDR();
    
                _MemAccessor.setHighOrderByte(_MemAccessor.decodedByte2);

                this.PC += 2;
            }
    
            _MemAccessor.read();
        }
    
        /**
         * The execute cycle.
         */
        public execute() {
            switch (this.IR) {
                case OpCode.LDA_C: {
                    this.Acc = _MemAccessor.decodedByte1;
                    break;
                }
        
                case OpCode.LDA_M: {
                    this.Acc = _MemAccessor.getMDR();
                    break;
                }
        
                case OpCode.STA: {
                    _MemAccessor.write(this.Acc);
                    break;
                }
        
                case OpCode.ADC: {
                    this.Acc += _MemAccessor.read();
                    break;
                }
        
                case OpCode.LDX_C: {
                    this.Xreg = _MemAccessor.decodedByte1;
                    break;
                }
        
                case OpCode.LDX_M: {
                    this.Xreg = _MemAccessor.getMDR();
                    break;
                }
        
                case OpCode.LDY_C: {
                    this.Yreg = _MemAccessor.decodedByte1;
                    break;
                }
        
                case OpCode.LDY_M: {
                    this.Yreg = _MemAccessor.getMDR();
                    break;
                }
        
                case OpCode.NOP: {
                    // No operation. Easy! :)
                    break;
                }
        
                case OpCode.BRK: {
                    _CurrentProcess.state = State.TERMINATED;
                    break;
                }
        
                case OpCode.CPX: {
                    if (this.Xreg === _MemAccessor.getMDR()) {
                        this.Zflag = 0x01;
                    } else {
                        this.Zflag = 0x00;
                    }
                    
                    break;
                }
        
                case OpCode.BNE: {
                    if (this.Zflag == 0x00) {
                        let offset = _MemAccessor.getMDR();
                        let newLoc = this.PC + offset; // The new location

                        if (newLoc > 0x100) {
                            newLoc -= 0x100;
                        }

                        this.PC = newLoc;
                    }
                    
                    break;
                }
        
                case OpCode.INC: {
                    this.Acc = _MemAccessor.getMDR();
                    this.Acc += 1;
                    _MemAccessor.write(this.Acc);
                    
                    break;
                }
        
                case OpCode.SYS: {
                    if (this.Xreg === 1) {
                        _KernelInterruptQueue.enqueue(new Interrupt(SYS_PRINT_INT, [this.Yreg.toString()]));
                    } else if (this.Xreg === 2) {
                        _KernelInterruptQueue.enqueue(new Interrupt(SYS_PRINT_STR, [this.Yreg]));
                    }
                    
                    break;
                }
                
                default: {
                    _CurrentProcess.state = State.TERMINATED;
                    break;
                }
            }
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            
            this.fetch();

            let decodeCycles = DecodeCycles.get(this.IR);
            this.decode(decodeCycles);

            this.execute();
        }

        public setState(pc: number, ir: number, acc: number, xReg: number, yReg: number, zFlag: number): void {
            this.PC = pc;
            this.IR = ir;
            this.Acc = acc;
            this.Xreg = xReg;
            this.Yreg = yReg;
            this.Zflag = zFlag;
        }
    }
}
