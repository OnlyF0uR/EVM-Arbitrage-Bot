const fs = require('fs');

const log = (message, ...optionalParams) => {
  if (process.env.ENABLE_LOGGING === 'true') {
    console.log(message, ...optionalParams);
  }
};

const aToBProfit = (
  flashFee,
  amountIn,
  highestPlatform,
  lowestPlatform,

  network = null,
  baseToken = null
) => {
  let trade1Ratio = highestPlatform.ratio;
  let trade2Ratio = lowestPlatform.ratio;

  if (trade1Ratio < trade2Ratio) {
    console.error('Logic failure, trade1Ratio is less than trade2Ratio');
    return -1;
  }

  trade1Ratio = trade1Ratio * amountIn; // token1
  let amountAfterTrade2 = trade1Ratio * (1 / trade2Ratio); // token0
  const amountOut = amountAfterTrade2 - flashFee * amountIn; // token0
  const profit = amountOut - amountIn; // token0

  log(
    `Potential profit (${highestPlatform.name} in, ${lowestPlatform.name} out):`,
    profit
  );

  if (profit > 0) {
    if (highestPlatform && lowestPlatform && baseToken) {
      const filePath = process.env.LOG_FILE;
      if (filePath && filePath !== '') {
        const data = `${network},${highestPlatform.name},${lowestPlatform.name},${baseToken},${flashFee},${amountIn},${trade1Ratio},${amountAfterTrade2},${amountOut},${profit}\n`;

        // check if file exists
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(
            filePath,
            'network, highestPlatform,lowestPlatform,baseToken,flashFee,amountIn,amountAfterTrade1,amountAfterTrade2,amountOut,profit\n'
          );
        }

        fs.appendFile(filePath, data, { flag: 'a+' }, (err) => {
          if (err) {
            console.error('Failed to save opportunity:', err);
          }
        });
      }
    }
  }

  // Return the profit
  return profit;
};

const getOppositPlatforms = (cache) => {
  if (Object.keys(cache).length < 2) {
    return null;
  }

  // Compare all items in cache
  let highest = 0;
  let highestPlatform = null;
  for (const platform in cache) {
    if (cache[platform] > highest) {
      highest = cache[platform];
      highestPlatform = platform;
    }
  }

  // Now get lowest
  let lowest = Infinity; // Initialize with Infinity so any number will be lower
  let lowestPlatform = null;
  for (const platform in cache) {
    if (cache[platform] < lowest) {
      lowest = cache[platform];
      lowestPlatform = platform;
    }
  }

  return { highestPlatform, lowestPlatform };
};

module.exports = {
  aToBProfit,
  getOppositPlatforms,
  log,
};
