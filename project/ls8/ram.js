/**
 * RAM access
 */
class RAM {
  constructor(size) {
    this.mem = new Array(size);
    this.mem.fill(0);
  }

  /**
   * Write (store) MDR value at address MAR
   */
  write(MAR, MDR) {
    // !!! IMPLEMENT ME
    // write the value in the MDR to the address MAR
    return this.access(MAR, MDR, true);
  }

  /**
   * Read (load) MDR value from address MAR
   *
   * @returns MDR
   */
  read(MAR) {
    // !!! IMPLEMENT ME
    // Read the value in address MAR and return it
    return this.access(MAR, null, false);
  }

  access(MAR, MDR, write) {
    if (write) {
      this.mem[MAR] = MDR;
    } else {
      MDR = this.mem[MAR];
    }
    return MDR;
  }
}

module.exports = RAM;
