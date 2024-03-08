const sqrtToPrice = (sqrtPriceX96, dec0, dec1) => {
  const numerator = sqrtPriceX96 ** 2;
  const denominator = 2 ** 192;
  const ratio = numerator / denominator;
  const decimalShift = 10 ** (dec0 - dec1);
  return ratio * decimalShift;
};

module.exports = {
  sqrtToPrice,
};
