const v3PoolArtifact = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json');
const { aToBProfit, log } = require('./lib');
const { ethers } = require('ethers');
const { sqrtToPrice } = require('./exchanges/UniswapV3');
const { ratio0ToPrice } = require('./exchanges/UniswapV2');

const COLOURS = {
  uniswap_v3: '\x1b[36m',
  uniswap_v2: '\x1b[35m',
  sushiswap_v3: '\x1b[31m',
  sushiswap_v2: '\x1b[33m',
  quickswap_v3: '\x1b[34m',
  quickswap_v2: '\x1b[32m',
};

const listenerCache = {};

const setListenerCache = (
  network,
  pair_identifier,
  platformAddress,
  platformName,
  ratio,
  poolFee
) => {
  listenerCache[network][pair_identifier][platformName] = {
    address: platformAddress,
    name: platformName,
    ratio,
    poolFee,
  };
};

// Provides the object that comes when entering the pair_identifier in listenerCache [platform]: ratio
const getOpposingPlatforms = (subCache) => {
  if (Object.keys(subCache).length < 2) {
    return { highestPlatform: null, lowestPlatform: null };
  }

  // Compare all items in cache
  let highest = 0;
  let highestPlatform = {
    address: null,
    name: null,
    ratio: null,
    poolFee: null,
  };
  for (const iterator in subCache) {
    if (subCache[iterator].ratio > highest) {
      highest = subCache[iterator].ratio;
      highestPlatform = {
        address: subCache[iterator].address,
        name: subCache[iterator].name,
        ratio: subCache[iterator].ratio,
        poolFee: subCache[iterator].poolFee,
      };
    }
  }

  // Now get lowest
  let lowest = Infinity; // Initialize with Infinity so any number will be lower
  let lowestPlatform = {
    address: null,
    name: null,
    ratio: null,
    poolFee: null,
  };
  for (const iterator in subCache) {
    console.log(subCache[iterator].ratio);
    if (subCache[iterator].ratio < lowest) {
      lowest = subCache[iterator].ratio;
      lowestPlatform = {
        address: subCache[iterator].address,
        name: subCache[iterator].name,
        ratio: subCache[iterator].ratio,
        poolFee: subCache[iterator].poolFee,
      };
    }
  }

  if (
    highestPlatform.address == null ||
    lowestPlatform.address == null ||
    highestPlatform.name == null ||
    lowestPlatform.name == null ||
    highestPlatform.ratio == null ||
    lowestPlatform.ratio == null ||
    highestPlatform.poolFee == null ||
    lowestPlatform.poolFee == null
  ) {
    return { highestPlatform: null, lowestPlatform: null };
  }

  // This should never happen, but just in case
  if (highestPlatform.address === lowestPlatform.address) {
    console.error(
      'Same platform:',
      highestPlatform,
      lowestPlatform,
      Object.keys(subCache).length
    );
    return { highestPlatform: null, lowestPlatform: null };
  }

  return { highestPlatform, lowestPlatform };
};

const initiate = (networkMeta, pools) => {
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    if (networkMeta[pool.network] == null) {
      console.warn('No networkMeta set for: ', pool.network);
      continue;
    }

    // Now we have access to networkMeta[pool.network].provider

    // Cache building
    if (listenerCache[pool.network] == null) {
      listenerCache[pool.network] = {};
    }
    if (listenerCache[pool.network][pool.pair_identifier] == null) {
      listenerCache[pool.network][pool.pair_identifier] = {};
    }

    // NOTE: We assume the user entered the correct platform corresponding to the network
    if (
      pool.platform === 'uniswap_v3' ||
      pool.platform === 'sushiswap_v3' ||
      pool.platform === 'quickswap_v3' ||
      pool.platform === 'pancakeswap_v3'
    ) {
      handleUniswapV3(networkMeta[pool.network].provider, pool);
    } else if (
      pool.platform === 'uniswap_v2' ||
      pool.platform === 'sushiswap_v2' ||
      pool.platform === 'quickswap_v2' ||
      pool.platform === 'pancakeswap_v2'
    ) {
      handleUniswapV2(networkMeta[pool.network].provider, pool);
    }
  }
};

const handleUniswapV3 = (provider, pool) => {
  const v3Pool = new ethers.Contract(
    pool.address,
    v3PoolArtifact.abi,
    provider
  );

  const listener = (sender, recipient, amount0, amount1, sqrtPriceX96) => {
    let ratio = sqrtToPrice(
      String(sqrtPriceX96),
      pool.tokenInDecimals,
      pool.tokenOutDecimals
    );

    if (pool.isFlipped) {
      ratio = 1 / ratio;
    }

    log(
      `${COLOURS[pool.platform]}[${pool.pair_identifier}-${pool.platform}]`,
      'ratio:',
      `${ratio} ${pool.tokenIn}/${pool.tokenOut}, ${1 / ratio} ${
        pool.tokenOut
      }/${pool.tokenIn}\x1b[0m`
    );

    setListenerCache(
      pool.network,
      pool.pair_identifier,
      pool.address,
      pool.platform,
      ratio,
      pool.poolFee
    );

    const { highestPlatform, lowestPlatform } = getOpposingPlatforms(
      listenerCache[pool.network][pool.pair_identifier]
    );
    if (!highestPlatform || !lowestPlatform) return;

    const profit = aToBProfit(
      0,
      pool.amountInIfEntry,
      highestPlatform,
      lowestPlatform,

      pool.network,
      pool.tokenIn
    );

    // TODO: Make trade
    const data = {
      buy: {
        poolAddress: highestPlatform.address,
        tokenIn: pool.tokenInAddress,
        poolFee: highestPlatform.poolFee,
        isLegacy: false,
      },
      sell: {
        poolAddress: lowestPlatform.address,
        tokenIn: pool.tokenOutAddress,
        poolFee: lowestPlatform.poolFee,
        isLegacy: false,
      },
    };
  };

  const setupSwapListener = () => {
    // Remove the old listener, if it exists
    if (v3Pool.listenerCount('Swap') > 0) {
      v3Pool.off('Swap', listener);
    }

    // Start listening for the 'Swap' event
    v3Pool.on('Swap', listener);
  };

  setupSwapListener();
  setInterval(setupSwapListener, 5 * 60 * 1000);

  console.log(
    `${pool.platform} on ${pool.network} initiated for ${pool.tokenIn}/${pool.tokenOut}.`
  );
};

const handleUniswapV2 = (provider, pool) => {
  const v2Pool = new ethers.Contract(
    pool.address,
    v3PoolArtifact.abi,
    provider
  );

  const listener = (
    sender,
    amount0In,
    amount1In,
    amount0Out,
    amount1Out,
    to
  ) => {
    let ratio = ratio0ToPrice(amount0In, amount1Out);
    console.log('ALERT CHECK THIS: ', ratio);

    if (pool.isFlipped) {
      ratio = 1 / ratio;
    }

    log(
      `${COLOURS[pool.platform]}[${pool.pair_identifier}-${pool.platform}]`,
      'ratio:',
      `${ratio} ${pool.tokenIn}/${pool.tokenOut}, ${1 / ratio} ${
        pool.tokenOut
      }/${pool.tokenIn}\x1b[0m`
    );

    setListenerCache(
      pool.network,
      pool.pair_identifier,
      pool.address,
      pool.platform,
      ratio,
      pool.poolFee
    );

    const { highestPlatform, lowestPlatform } = getOpposingPlatforms(
      listenerCache[pool.network][pool.pair_identifier]
    );
    if (!highestPlatform || !lowestPlatform) return;

    const profit = aToBProfit(
      0,
      pool.amountInIfEntry,
      highestPlatform,
      lowestPlatform,

      pool.network,
      pool.tokenIn
    );

    // Make your trade here ...
  };

  const setupSwapListener = () => {
    // Remove the old listener, if it exists
    if (v2Pool.listenerCount('Swap') > 0) {
      v2Pool.off('Swap', listener);
    }

    // Start listening for the 'Swap' event
    v2Pool.on('Swap', listener);
  };

  setupSwapListener();
  setInterval(setupSwapListener, 5 * 60 * 1000);

  console.log(
    `${pool.platform} on ${pool.network} initiated for ${pool.tokenIn}/${pool.tokenOut}.`
  );
};

module.exports = {
  initiate,
};
