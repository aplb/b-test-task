const getTop10PairsByVolume = (pairs) => {
  pairs.sort((a, b) => {
    const vol1 = parseFloat(a.volume);
    const vol2 = parseFloat(b.volume);

    return vol2 - vol1;
  });

  pairs = pairs.slice(0, 10);
  return pairs;
};

module.exports = { getTop10PairsByVolume };
