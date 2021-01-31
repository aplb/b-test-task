const assert = require('assert');
const Monitor = require('../src/monitoring');

const addValues = (mon, values) => {
  for (const val of values) {
    mon.addValue(val);
  }
};

const monitorValuesTest = () => {
  const mon = new Monitor();
  addValues(mon, [7, 3, 5, 9, 1]);
  assert.equal(mon.getMin(), 1, 'should find min latency');
  assert.equal(mon.getMax(), 9, 'should find max latency');
  assert.equal(mon.getMedian(), 5, 'should find median latency');
  mon.reset();
  assert.equal(mon.values.length, 0, 'should reset values');
  assert.equal(mon.getMin(), 0, 'should reset min');
  assert.equal(mon.getMax(), 0, 'should reset max');
  assert.equal(mon.getMedian(), 0, 'should reset median');
  addValues(mon, [7, 3, 9, 1]);
  assert.equal(mon.getMin(), 1, 'should find min latency');
  assert.equal(mon.getMax(), 9, 'should find max latency');
  assert.equal(mon.getMedian(), (3 + 7) / 2, 'should find median latency');
};

monitorValuesTest();
