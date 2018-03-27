/**
 * LS-8 v2.0 emulator skeleton code
 */

const HLT = 0b00000001;
const LDI = 0b10011001;
const PRN = 0b01000011;
const MUL = 0b10101010;

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {
  /**
   * Initialize the CPU
   */
  constructor(ram) {
    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

    // Special-purpose registers
    this.reg.PC = 0; // Program Counter
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
  alu(op, regA, regB) {
    let varA = this.reg[regA];
    let varB = this.reg[regB];
    switch (op) {
      case 'MUL':
        this.reg[regA] = (varA * varB) & 255;
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
    let IR = this.ram.read(this.reg.PC);

    // Debugging output
    //console.log(`${this.reg.PC}: ${IR.toString(2)}`);

    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.

    let operandA = this.ram.read(this.reg.PC + 1);
    let operandB = this.ram.read(this.reg.PC + 2);

    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.

    switch (IR) {
      case HLT:
        this.stopClock();
        break;

      case LDI:
        this.reg[operandA] = operandB;
        break;

      case PRN:
        console.log(this.reg[operandA]);
        break;
      case MUL:
        this.alu('MUL', operandA, operandB);
        break;

      default:
        console.log('Unknown instruction: ' + IR.toString(2));
        this.stopClock();
        break;
    }

    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.

    this.reg.PC += (IR >>> 6) + 1;
  }
}

module.exports = CPU;
