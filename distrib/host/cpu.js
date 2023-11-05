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
         * The fetch cycle.
         */
        fetch() {
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
        decode(numOperands) {
            if (numOperands === 1) {
                this.PC++;
                _MemAccessor.setLowOrderByte(this.PC);
                _MemAccessor.decodedByte1 = _MemAccessor.read();
            }
            else if (numOperands === 2) {
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
        execute() {
            switch (this.IR) {
                case TSOS.OpCode.LDA_C: {
                    this.Acc = _MemAccessor.decodedByte1;
                    break;
                }
                case TSOS.OpCode.LDA_M: {
                    this.Acc = _MemAccessor.getMDR();
                    break;
                }
                case TSOS.OpCode.STA: {
                    _MemAccessor.write(this.Acc);
                    break;
                }
                case TSOS.OpCode.ADC: {
                    this.Acc += _MemAccessor.read();
                    break;
                }
                case TSOS.OpCode.LDX_C: {
                    this.Xreg = _MemAccessor.decodedByte1;
                    break;
                }
                case TSOS.OpCode.LDX_M: {
                    this.Xreg = _MemAccessor.getMDR();
                    break;
                }
                case TSOS.OpCode.LDY_C: {
                    this.Yreg = _MemAccessor.decodedByte1;
                    break;
                }
                case TSOS.OpCode.LDY_M: {
                    this.Yreg = _MemAccessor.getMDR();
                    break;
                }
                case TSOS.OpCode.NOP: {
                    // No operation. Easy! :)
                    break;
                }
                case TSOS.OpCode.BRK: {
                    this.init();
                    _CurrentProcess.state = TSOS.State.TERMINATED;
                    break;
                }
                case TSOS.OpCode.CPX: {
                    if (this.Xreg === _MemAccessor.getMDR()) {
                        this.Zflag = 0x01;
                    }
                    else {
                        this.Zflag = 0x00;
                    }
                    break;
                }
                case TSOS.OpCode.BNE: {
                    if (this.Zflag == 0x00) {
                        let offset = _MemAccessor.getMDR();
                        let newLoc = this.PC + offset; // The new location
                        // The only space we're working with right now
                        if (newLoc > 256) {
                            newLoc -= 256;
                        }
                        this.PC = newLoc;
                    }
                    break;
                }
                case TSOS.OpCode.INC: {
                    this.Acc = _MemAccessor.getMDR();
                    this.Acc += 1;
                    _MemAccessor.write(this.Acc);
                    break;
                }
                case TSOS.OpCode.SYS: {
                    if (this.Xreg === 1) {
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYS_PRINT_INT, [this.Yreg.toString()]));
                    }
                    else if (this.Xreg === 2) {
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYS_PRINT_STR, [this.Yreg]));
                    }
                    break;
                }
                default: {
                    _CurrentProcess.state = TSOS.State.TERMINATED;
                }
            }
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            this.fetch();
            let decodeCycles = TSOS.DecodeCycles.get(this.IR);
            this.decode(decodeCycles);
            this.execute();
        }
        setState(pc, ir, acc, xReg, yReg, zFlag) {
            this.PC = pc;
            this.IR = ir;
            this.Acc = acc;
            this.Xreg = xReg;
            this.Yreg = yReg;
            this.Zflag = zFlag;
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map