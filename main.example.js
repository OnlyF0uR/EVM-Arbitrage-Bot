const dotenv = require('dotenv');
const ethers = require('ethers');
const { initiate } = require('./init');

dotenv.config();

const optimismProvider = new ethers.JsonRpcProvider(
  process.env.OPTIMISM_RPC_URL
);

const networkMeta = {
  optimism: {
    provider: optimismProvider,
  },
};

const cases = [
  {
    network: 'optimism',
    pair_identifier: 'optimism_weth_op',
    platform: 'uniswap_v3',
    tokenIn: 'wETH',
    tokenInAddress: '0x4200000000000000000000000000000000000006',
    tokenInDecimals: 18,
    tokenOut: 'OP',
    tokenOutAddress: '0x4200000000000000000000000000000000000042',
    tokenOutDecimals: 18,
    isFlipped: false,
    amountInIfEntry: 1,
    poolFee: 0.3 * 10000,
    address: '0x68F5C0A2DE713a54991E01858Fd27a3832401849',
  },
  {
    network: 'optimism',
    pair_identifier: 'optimism_weth_op',
    platform: 'sushiswap_v3',
    tokenIn: 'wETH',
    tokenInAddress: '0x4200000000000000000000000000000000000006',
    tokenInDecimals: 18,
    tokenOut: 'OP',
    tokenOutAddress: '0x4200000000000000000000000000000000000042',
    tokenOutDecimals: 18,
    isFlipped: false,
    amountInIfEntry: 1,
    poolFee: 0.3 * 10000,
    address: '0x58b2f113244ddc9332c46af25bc223873e68ff3d',
  },
];

initiate(networkMeta, cases);
