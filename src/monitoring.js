const { ping } = require('./rest');

const reportFreq = 1000 * 60; // 1 min
const pingFreq = 1000 * 6; // 6 sec

class Monitor {
  constructor() {
    this.values = [];
    this.min = 0;
    this.max = 0;
    this.reportIntervalId = null;
    this.pingIntervalId = null;
  }

  start() {
    this.reportIntervalId = setInterval(() => {
      if (this.pingIntervalId !== null) {
        clearInterval(this.pingIntervalId);
      }

      this.print();
      this.reset();
      this.startPing();
    }, reportFreq);

    this.startPing();
    console.log('\x1b[33m==== Monitor started ====\x1b[0m');
  }

  startPing() {
    this.pingIntervalId = setInterval(async () => {

      try {
        // consider using process.hrtime if better resolution needed
        const startTime = new Date().getTime();
        await ping();
        const endTime = new Date().getTime();
        this.addValue(endTime - startTime);
      } catch (e) {
        console.log(e);
      }
    }, pingFreq);
  }

  stop() {
    if (this.reportIntervalId !== null) {
      clearInterval(this.reportIntervalId);
    }

    if (this.pingIntervalId !== null) {
      clearInterval(this.pingIntervalId);
    }

    this.reportIntervalId = null;
    this.pingIntervalId = null;
    reset();
  }

  getMin() {
    return this.values[0] || 0;
  }

  getMax() {
    return this.values[this.values.length - 1] || 0;
  }

  /*
   * find position O(log N), insert O(N)
   * hence addNum takes O(N), find median O(1)
   * For bigger payloads might be using 2 heaps for O(log N) addValue
   */
  addValue(value) {
    const pos = this.searchInsertPos(value);
    this.values.splice(pos, 0, value);
  }

  searchInsertPos(target) {
    let lo = 0;
    let hi = this.values.length - 1;

    while (lo <= hi) {
      let mid = lo + ((hi - lo) >>> 1);

      if (target === this.values[mid]) {
        return mid;
      } else if (target < this.values[mid]) {
        hi = mid - 1;
      } else { // target > this.values[mid]
        lo = mid + 1;
      }
    }

    return lo;
  }

  /*
   * [1, 3, 5, 7, 9] -- take 5
   * [1, 3, 7, 9] -- take (3 + 7) / 2
   */
  getMedian() {
    const len = this.values.length;

    if (len == 0) {
      return 0;
    }

    return len % 2 == 1 ?
      this.values[(len >>> 1)] :
      (this.values[(len >>> 1) - 1] + this.values[(len >>> 1)]) / 2;
  }

  print() {
    const out = [];
    out.push('\x1b[33m======================');
    out.push(`Min: ${this.getMin()}ms`);
    out.push(`Median: ${this.getMedian()}ms`);
    out.push(`Max: ${this.getMax()}ms`);
    out.push('======================\x1b[0m');
    console.log(out.join('\n'));
  }

  reset() {
    this.values = [];
    this.min = 0;
    this.max = 0;
    this.median = 0;
  }
}

module.exports = Monitor;
