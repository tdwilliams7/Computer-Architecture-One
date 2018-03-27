/**
 * LS-8 v2.0 emulator skeleton code
 */

/**
 * Class for simulating a simple Computer (CPU & memory)
 */

const ADD = 0b10101000; // ADD
const AND = 0b10110011; // AND
const CALL = 0b01001000; // CALL
const CMP = 0b10100000; // CMP
const DEC = 0b01111001; // DEC
const DIV = 0b10101011; // DIV
const HLT = 0b00000001; // Halt but don't catch fire
const INC = 0b01111000; // INC
const INT = 0b01001010; // Software interrupt
const IRET = 0b00001011; // Return from interrupt
const JEQ = 0b01010001; // JEQ
const JGT = 0b01010100; // JGT
const JLT = 0b01010011; // JLT
const JMP = 0b01010000; // JMP
const JNE = 0b01010010; // JNE
const LD = 0b10011000; // Load
const LDI = 0b10011001; // LDI
const MOD = 0b10101100; // MOD
const MUL = 0b10101010; // MUL
const NOP = 0b00000000; // NOP
const NOT = 0b01110000; // NOT
const OR = 0b10110001; // OR
const POP = 0b01001100; // Pop
const PRA = 0b01000010; // Print alpha
const PRN = 0b01000011; // Print numeric
const PUSH = 0b01001101; // Push
const RET = 0b00001001; // Return
const ST = 0b10011010; // Store
const SUB = 0b10101001; // SUB
const XOR = 0b10110010; // XOR

const IM = 0x05;
const SP = 0x07;

const FLAG_EQ = 0;
const FLAG_GT = 1;
const FLAG_LT = 2;

class CPU {
  /**
   * Initialize the CPU
   */
  constructor(ram) {
    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

    this.reg[IM] = 0;
    this.reg[SP] = 0xf4;

    // Special-purpose registers
    this.reg.PC = 0; // Program Counter
    this.reg.IR = 0;
    this.reg.FL = 0;

    this.interuptsEnabled = true;

    this.setupBranchTable();
  }
  setFlag(flag, value) {
    value = +value;
    if (value) {
      this.reg.FL |= 1 << flag;
    } else {
      this.reg.FL &= ~(1 << flag);
    }
  }

  getFlag(flag) {
    return (this.reg.FL & (1 << flag)) >> flag;
  }

  setupBranchTable() {
    let bt = {};

    bt[ADD] = this.ADD;
    bt[AND] = this.AND;
    bt[CALL] = this.CALL;
    bt[CMP] = this.CMP;
    bt[DEC] = this.DEC;
    bt[DIV] = this.DIV;
    bt[HLT] = this.HLT;
    bt[INC] = this.INC;
    bt[INT] = this.INT;
    bt[IRET] = this.IRET;
    bt[JEQ] = this.JEQ;
    bt[JGT] = this.JGT;
    bt[JLT] = this.JLT;
    bt[JMP] = this.JMP;
    bt[JNE] = this.JNE;
    bt[LD] = this.LD;
    bt[LDI] = this.LDI;
    bt[MOD] = this.MOD;
    bt[MUL] = this.MUL;
    bt[NOP] = this.NOP;
    bt[NOT] = this.NOT;
    bt[OR] = this.OR;
    bt[POP] = this.POP;
    bt[PRA] = this.PRA;
    bt[PRN] = this.PRN;
    bt[PUSH] = this.PUSH;
    bt[RET] = this.RET;
    bt[ST] = this.ST;
    bt[SUB] = this.SUB;
    bt[XOR] = this.XOR;

    // Bind all the functions to this so we can call them later
    for (let k of Object.keys(bt)) {
      bt[k] = bt[k].bind(this);
    }

    this.branchTable = bt;
  }
  /**
   * Store value in memory address, useful for program loading
   */
  poke(address, value) {
    this.ram.write(address, value);
  }

  /**
   * Starts the clock ticking on the CPU
   */
  startClock() {
    const _this = this;

    this.clock = setInterval(() => {
      _this.tick();
    }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);
  }

  end() {
    this.stopClock();
  }

  /**
   * ALU functionality
   *
   * The ALU is responsible for math and comparisons.
   *
   * If you have an instruction that does math, i.e. MUL, the CPU would hand
   * it off to it's internal ALU component to do the actual work.
   *
   * op can be: ADD SUB MUL DIV INC DEC CMP
   */
  alu(op, regA, regB, immediate) {
    let valA, valB;

    valA = this.reg[regA];

    if (immediate === undefined) {
      if (regB !== undefined) {
        valB = this.reg[regB];
      }
    } else {
      valB = immediate;
    }

    switch (op) {
      case 'ADD':
        this.reg[regA] = valA + valB;
        break;
      case 'AND':
        this.reg[regA] = valA & valB;
        break;
      case 'CMP':
        this.setFlag(FLAG_EG, valA === valB);
        this.setFlag(FLAG_GT, valA > valB);
        this.setFlag(FLAG_LT, valA < valB);
        break;
      case 'DEC':
        this.reg[regA] = (valA - 1) & 0xff;
        break;
      case 'DIV':
        if (valB === 0) {
          console.log('Error: Dividing by 0');
          this.end();
        }
        this.reg[regA] = valA / valB;
        break;
      case 'INC':
        this.reg[regA] = (valA + 1) & 0xff;
        break;
      case 'MOD':
        if (valB === 0) {
          console.log('ERROR: MOD 0');
          this.stop();
        }
        this.reg[regA] = valA % valB;
        break;
      case 'MUL':
        this.reg[regA] = (valA * valB) & 255;
        break;
      case 'NOT':
        this.reg[regA] = ~valA;
        break;
      case 'OR':
        this.reg[regA] = valA | valB;
        break;
      case 'SUB':
        this.reg[regA] = (valA - valB) & 255;
        break;
      case 'XOR':
        this.reg[regA] = valA ^ valB;
        break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  // Check to see if there's an interrupt
  tick() {
    if (this.interruptsEnabled) {
      // Take the current interrupts and mask them out with the interrupt
      // mask
      const maskedInterrupts = this.reg[IS] & this.reg[IM];

      // Check all the masked interrupts to see if they're active
      for (let i = 0; i < 8; i++) {
        // If it's still 1 after being masked, handle it
        if (((maskedInterrupts >> i) & 0x01) === 1) {
          // Only handle one interrupt at a time
          this.interruptsEnabled = false;

          // Clear this interrupt in the status register
          this.reg[IS] &= ~intMask[i];

          // Push return address
          this._push(this.reg.PC);

          // Push flags
          this._push(this.reg.FL);

          // Push registers R0-R6
          for (let r = 0; r <= 6; r++) {
            this._push(this.reg[r]);
          }

          // Look up the vector (handler address) in the
          // interrupt vector table
          const vector = this.ram.read(0xf8 + i);

          this.reg.PC = vector; // Jump to it

          // Stop looking for more interrupts, since we do one
          // at a time
          break;
        }
      }
    }
    // Load the instruction register from the current PC
    this.reg.IR = this.ram.read(this.reg.PC);

    //console.log(`${this.reg.PC}: ${this.reg.IR.toString(2)}`);

    // Based on the value in the Instruction Register, jump to the
    // appropriate hander
    const handler = this.branchTable[this.reg.IR];

    if (handler === undefined) {
      console.log(`ERROR: invalid instruction ${this.reg.IR.toString(2)}`);
      this.stop();
      return;
    }

    // Read in the two next bytes just in case they are needed by the handler
    const operandA = this.ram.read((this.reg.PC + 1) & 0xff);
    const operandB = this.ram.read((this.reg.PC + 2) & 0xff);

    // We need to use call() so we can set the "this" value inside the
    // handler (otherwise it will be undefined in the handler).
    //
    // The handler _may_ return a new PC if it wants to set it explicitly.
    // E.g. CALL, JMP and variants, IRET, and RET all set the PC to a new
    // destination.

    const newPC = handler(operandA, operandB);

    if (newPC === undefined) {
      // Move the PC to the next instruction.
      // First get the instruction size, then add to PC
      const operandCount = (this.reg.IR >> 6) & 0b11; //
      const instSize = operandCount + 1;

      this.alu('ADD', 'PC', null, instSize); // Next instruction
    } else {
      // Handler wants the PC set to exactly this
      this.reg.PC = newPC;
    }
  }

  ADD(regA, regB) {
    this.alu('ADD', regA, regB);
  }

  AND(regA, regB) {
    this.alu('AND', regA, regB);
  }

  CALL(reg) {
    this._push(this.reg.PC + 2);
    const address = this.reg[reg];
    return address;
  }

  DEC(reg) {
    this.alu('DEC', reg);
  }

  DIV(regA, regB) {
    this.alu('DIV', regA, regB);
  }

  HLT() {
    this.end();
  }

  INC(reg) {
    this.alu('INC', reg);
  }

  INT(reg) {
    const intNum = this.reg[reg];
    this.reg[IM] |= intNum;
  }

  IRET() {
    for (let i = 6; i >= 6; i--) {
      this.reg[r] = this._pop();
    }

    this.reg.FL = this._pop();
    const nextPC = this._pop();
    this.interuptsEnabled = true;
    return nextPC;
  }

  JEQ(reg) {
    if (this.getFlag(FLAG_EG)) {
      return this.reg[reg];
    }
  }

  JGT(reg) {
    if (this.getFlag(FLAG_GT)) {
      return this.reg[reg];
    }
  }

  JLT(reg) {
    if (this.getFlag(FLAG_LT)) {
      return this.reg[reg];
    }
  }

  JMP(reg) {
    return this.reg[reg];
  }

  JNE(reg) {
    if (!this.getFlag(FLAG_EG)) {
      return this.reg[reg];
    }
  }

  LD(regA, regB) {
    let valb = this.ram.read(this.reg[regB]);

    this.reg[regA] = valb;
  }

  LDI(reg, int) {
    this.reg[reg] = int;
  }

  MOD(regA, regB) {
    this.alu('MOD', regA, regB);
  }

  MUL(regA, regB) {
    this.alu('MUL', regA, regB);
  }

  NOP() {
    // this does nothing
  }

  NOT(reg) {
    this.alu('NOT', reg);
  }

  OR(regA, regB) {
    this.alu('OR', regA, regB);
  }

  _pop() {
    const val = this.ram.read(this.reg[SP]);
    this.alu('INC', SP);
    return val;
  }

  PRA(reg) {
    console.log(String.fromCharCode(this.reg[reg]));
  }

  PRN(reg) {
    console.log(this.reg[reg]);
  }

  _push(val) {
    this.alu('DEC', SP);
    this.ram.write(this.reg[SP], val);
  }

  PUSH(reg) {
    this._push(this.reg[reg]);
  }

  RET() {
    const nextPC = this._pop();
    return nextPC;
  }

  ST(regA, regB) {
    this.ram.write(this.reg[regA], this.reg[regB]);
  }

  SUB(regA, regB) {
    this.alu('SUB', regA, regB);
  }

  XOR(regA, regB) {
    this.alu('XOR', regA, regB);
  }
}

module.exports = CPU;
