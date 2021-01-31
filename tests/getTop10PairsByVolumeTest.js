const assert = require('assert');
const { getTop10PairsByVolume } = require('../src/utils');
const payload = require('./pairs-payload.js');

const expected = ["178423132.30000000", "171265300.00000000", "167111468.10000000",
  "163647933.00000000", "157942524.00000000", "156230970.00000000",
  "153842644.00000000", "151665232.70000000", "149061664.00000000", "141995928.80000000"];

const getTop10PairsByVolumeTest = () => {
  const pairs = getTop10PairsByVolume(payload);
  assert.deepStrictEqual(pairs.map((p) => p.volume), expected, 'should detect top volume pairs');
};

getTop10PairsByVolumeTest();
