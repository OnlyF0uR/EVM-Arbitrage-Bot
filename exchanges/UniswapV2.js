const ratio0ToPrice = (amount0In, amount1Out) =>
  1 / (Number(amount0In) / Number(amount1Out) / 10 ** 12);
const ratio1ToPrice = (amount1In, amount0Out) =>
  (Number(amount1In) / Number(amount0Out)) * 10 ** 12;

module.exports = {
  ratio0ToPrice,
  ratio1ToPrice,
};
