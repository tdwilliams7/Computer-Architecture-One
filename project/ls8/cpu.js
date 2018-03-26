/**
 * LS-8 v2.0 emulator skeleton code
 */

/**
 * Class for simulating a simple Computer (CPU & memory)
 */

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

    this.reg[SP] = 0xf4;

    // Special-purpose registers
    this.reg.PC = 0; // Program Counter
    this.reg.IR = 0;
    this.reg.FL = 0;
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
      case 'MUL':
        this.reg[regA] = (valA * valB) & 255;
        break;
      case 'OR':
        this.reg[regA] = valA | valB;
        break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {
    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the next instruction.)
    this.req.IR = this.ram.read(this.reg.PC);

    // !!! IMPLEMENT ME

    // Debugging output
    //console.log(`${this.reg.PC}: ${IR.toString(2)}`);

    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.

    // !!! IMPLEMENT ME
    const operandA = this.ram.read((this.reg.PC + 1) & 0xff);
    const operandB = this.ram.read((this.req.PC + 2) & 0xff);

    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.

    // !!! IMPLEMENT ME

    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.

    // !!! IMPLEMENT ME
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

  _push(val) {
    this.alu('DEC', SP);
    this.ram.write(this.reg[SP], val);
  }

  PUSH(reg) {
    this._push(this.reg[reg]);
  }
}

module.exports = CPU;
