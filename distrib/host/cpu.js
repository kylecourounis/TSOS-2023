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
var TSOS;
(function (TSOS) {
    class Cpu {
        PC;
        IR;
        Acc;
        Xreg;
        Yreg;
        Zflag;
        isExecuting;
        constructor(PC = 0, IR = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false) {
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        init() {
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
        getOffset(hex) {
            return 0xFF - hex + 1;
        }
        /**
         * The fetch cycle.
         */
        fetch() {
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
        decode(numOperands) {
            if (numOperands === 1) {
                this.PC++;
                _MMU.setLowOrderByte(this.PC);
                _MMU.decodedByte1 = _MMU.read();
            }
            else if (numOperands === 2) {
                this.PC++;
                if (_MMU.decodedByte1 == null) {
                    _MMU.readImmediate(this.PC);
                    _MMU.decodedByte1 = _MMU.getMDR();
                    _MMU.setLowOrderByte(_MMU.decodedByte1);
                }
                else {
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
        execute() {
            switch (this.IR) {
                case TSOS.OpCode.LDA_C: {
                    this.Acc = _MMU.decodedByte1;
                    break;
                }
                case TSOS.OpCode.LDA_M: {
                    this.Acc = _MMU.getMDR();
                    break;
                }
                case TSOS.OpCode.STA: {
                    _MMU.write(this.Acc);
                    break;
                }
                case TSOS.OpCode.ADC: {
                    this.Acc += _MMU.read();
                    break;
                }
                case TSOS.OpCode.LDX_C: {
                    this.Xreg = _MMU.decodedByte1;
                    break;
                }
                case TSOS.OpCode.LDX_M: {
                    this.Xreg = _MMU.getMDR();
                    break;
                }
                case TSOS.OpCode.LDY_C: {
                    this.Yreg = _MMU.decodedByte1;
                    break;
                }
                case TSOS.OpCode.LDY_M: {
                    this.Yreg = _MMU.getMDR();
                    break;
                }
                case TSOS.OpCode.TAY: {
                    this.Yreg = this.Acc;
                    break;
                }
                case TSOS.OpCode.NOP: {
                    // No operation. Easy! :)
                    break;
                }
                case TSOS.OpCode.BRK: {
                    this.Zflag = 10;
                    break;
                }
                case TSOS.OpCode.CPX: {
                    if (this.Xreg == _MMU.getMDR()) {
                        this.Zflag = 0x01;
                    }
                    else {
                        this.Zflag = 0x00;
                    }
                    break;
                }
                case TSOS.OpCode.BNE: {
                    if (this.Zflag == 0x01) {
                        let offset = this.getOffset(_MMU.getMDR());
                        this.PC -= offset;
                    }
                    break;
                }
                case TSOS.OpCode.INC: {
                    this.Acc = _MMU.getMDR();
                    this.Acc += 1;
                    _MMU.write(this.Acc);
                    break;
                }
                case TSOS.OpCode.SYS: {
                    if (this.Xreg === 1) {
                        _StdOut.putText(this.Yreg.toString());
                    }
                    else if (this.Xreg === 2) {
                        let data = TSOS.ASCII.getChar(_MMU.decodedByte1);
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
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.fetch();
            let decodeCycles = TSOS.DecodeCycles.get(this.IR);
            this.decode(decodeCycles);
            this.execute();
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map