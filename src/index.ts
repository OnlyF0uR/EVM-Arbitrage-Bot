require('dotenv').config()

import { ethers } from 'ethers';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { uniswapV3Price, uniswapV2Price, indexToDex } from './utils';
import { PriceLookup } from './interfaces';

// ============ Provider ============
const provider = new ethers.providers.JsonRpcProvider(
    // 'http://localhost:8545'
    `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
);

const IUniswapV2PairABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];
const cntrAbi = [{"inputs":[{"internalType":"address","name":"_flashAddrProvider","type":"address"},{"internalType":"address","name":"_uniswapV3Router","type":"address"},{"internalType":"address","name":"_quickswapRouter","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ADDRESSES_PROVIDER","outputs":[{"internalType":"contract ILendingPoolAddressesProvider","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LENDING_POOL","outputs":[{"internalType":"contract ILendingPool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"uint8","name":"index","type":"uint8"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"internalType":"struct Arbitrage.SwapData","name":"buy","type":"tuple"},{"components":[{"internalType":"uint8","name":"index","type":"uint8"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"internalType":"struct Arbitrage.SwapData","name":"sell","type":"tuple"}],"internalType":"struct Arbitrage.FlashData","name":"_data","type":"tuple"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"execute","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"assets","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint256[]","name":"premiums","type":"uint256[]"},{"internalType":"address","name":"initiator","type":"address"},{"internalType":"bytes","name":"params","type":"bytes"}],"name":"executeOperation","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"quickswapRouter","outputs":[{"internalType":"contract IUniswapV2Router02","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"uniswapV3Router","outputs":[{"internalType":"contract ISwapRouter","name":"","type":"address"}],"stateMutability":"view","type":"function"}];

let runCounter = 0;
const analyze = async (buyAmount: number, priceList: PriceLookup[]) => {
    priceList.sort((a, b) => b.token0_1 - a.token0_1);

    const tmpList = [];
    for (const [key, value] of Object.entries(priceList)) {
        tmpList.push({ Exchange: indexToDex(value.index), "In / Out": value.token0_1, "Out / In": value.token1_0, "PoolFee (%)": value.poolFee / 10000 })
    }
    console.table(tmpList);

    const buyAt = priceList[0];
    const sellAt = priceList[priceList.length - 1];

    console.log('Amount of xToken |', buyAmount);

    const yTokenAmount = buyAmount * buyAt.token0_1;
    console.log('Amount of yToken |', yTokenAmount);

    const xTokenAmount = yTokenAmount * sellAt.token1_0;
    console.log('Amount of xToken |', xTokenAmount);

    let endAmount = xTokenAmount - (buyAmount * 1.0009);
    if (parseFloat(process.env.PADDING as string) > 0) {
        endAmount *= parseFloat(process.env.PADDING as string);
    }
    console.log('Result (Base + Premium) - Amount |', endAmount);

    if (endAmount <= 0) {
        return null;
    }

    console.log(`Buy at: ${indexToDex(buyAt.index)}`);
    console.log(`Sell at: ${indexToDex(sellAt.index)}`);

    return { buy: { index: buyAt.index, fee: buyAt.poolFee }, sell: { index: sellAt.index, fee: sellAt.poolFee } };
}

function poolContract(adr: string, abi: any) {
    return new ethers.Contract(adr, abi, provider)
}

async function main() {
    const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY as string, provider);
    const cntr = new ethers.Contract(process.env.CONTRACT_ADDRESS as string, cntrAbi, signer);

    // ============ wMATIC/MANA ============
    {
        console.log('\nwMATIC/MANA');
        const data = await analyze(5000, [
            await uniswapV3Price(poolContract('0x56845fd95c766ecb0ab450fe2d105a19440a6e35', IUniswapV3PoolABI), 18, 18, 0, 3000),
            await uniswapV2Price(poolContract('0x6b0ce31ead9b14c2281d80a5dde903ab0855313a', IUniswapV2PairABI), 1, 3000)
        ]);
        if (data != null) {
            cntr.functions.execute({
                buy: {
                    index: data.buy.index,
                    token: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                    fee: data.buy.fee
                },
                sell: {
                    index: data.sell.index,
                    token: '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4',
                    fee: data.sell.fee,
                },
            }, ethers.utils.parseUnits('5000'), { gasLimit: process.env.GAS_LIMIT }).catch(console.error)
        }
    }

    // ============ wETH/MANA ============
    {
        console.log('\nwETH/MANA');
        const data = await analyze(1, [
            await uniswapV3Price(poolContract('0x28bdd3749bdea624a726ca153de1cb673f459b9d', IUniswapV3PoolABI), 18, 18, 0, 3000),
            await uniswapV2Price(poolContract('0x814b6c10bf752bbbea7bd68e5e65dc28b4f45982', IUniswapV2PairABI), 1, 3000)
        ]);
        if (data != null) {
            cntr.functions.execute({
                buy: {
                    index: data.buy.index,
                    token: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
                    fee: data.buy.fee
                },
                sell: {
                    index: data.sell.index,
                    token: '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4',
                    fee: data.sell.fee
                },
            }, ethers.utils.parseUnits('1'), { gasLimit: process.env.GAS_LIMIT }).catch(console.error)
        }
    }

    // ============ wMATIC/AVAX ============
    {
        console.log('\nwMATIC/AVAX');
        const data = await analyze(1000, [
            await uniswapV3Price(poolContract('0xfa3f210cbad19c8b860a256d67a400d616a87c2a', IUniswapV3PoolABI), 18, 18, 0, 3000),
            await uniswapV2Price(poolContract('0xeb477ae74774b697b5d515ef8ca09e24fee413b5', IUniswapV2PairABI), 1, 3000)
        ]);
        if (data != null) {
            cntr.functions.execute({
                buy: {
                    index: data.buy.index,
                    token: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                    fee: data.buy.fee
                },
                sell: {
                    index: data.sell.index,
                    token: '0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b',
                    fee: data.sell.fee
                },
            }, ethers.utils.parseUnits('1000'), { gasLimit: process.env.GAS_LIMIT }).catch(console.error)
        }
    }

    // ============ USDC/wETH ============
    {
        console.log('\nUSDC/wETH');
        const quickSwapData = await uniswapV2Price(poolContract('0x853ee4b2a13f8a742d64c8f088be7ba2131f670d', IUniswapV2PairABI), 1, 3000);
        quickSwapData.token0_1 /= 10**12;
        quickSwapData.token1_0 *= 10**12;

        const firebirdData = await uniswapV2Price(poolContract('0x853ee4b2a13f8a742d64c8f088be7ba2131f670d', IUniswapV2PairABI), 2, 3000);
        firebirdData.token0_1 /= 10**12;
        firebirdData.token1_0 *= 10**12;

        const data = await analyze(25000, [
            await uniswapV3Price(poolContract('0x45dda9cb7c25131df268515131f647d726f50608', IUniswapV3PoolABI), 6, 18, 0, 500),
            quickSwapData,
            firebirdData
        ]);
        if (data != null) {
            cntr.functions.execute({
                buy: {
                    index: data.buy.index,
                    token: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
                    fee: data.buy.fee
                },
                sell: {
                    index: data.sell.index,
                    token: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
                    fee: data.sell.fee
                },
            }, ethers.utils.parseUnits('25000', 6), { gasLimit: process.env.GAS_LIMIT }).catch(console.error)
        }
    }

    // ============ wBTC/wETH ============
    {
        console.log('\nwBTC/wETH'); 

        const quickSwapData = await uniswapV2Price(poolContract('0xdc9232e2df177d7a12fdff6ecbab114e2231198d', IUniswapV2PairABI), 1, 3000);
        quickSwapData.token0_1 /= 10**10;
        quickSwapData.token1_0 *= 10**10;

        const firebirdData = await uniswapV2Price(poolContract('0x10f525cfbce668815da5142460af0fcfb5163c81', IUniswapV2PairABI), 2, 3000);
        firebirdData.token0_1 /= 10**10;
        firebirdData.token1_0 *= 10**10;

        const data = await analyze(2, [
            await uniswapV3Price(poolContract('0x50eaedb835021e4a108b7290636d62e9765cc6d7', IUniswapV3PoolABI), 8, 18, 0, 500),
            quickSwapData,
            firebirdData
        ]);
        if (data != null) {
            cntr.functions.execute({
                buy: {
                    index: data.buy.index,
                    token: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
                    fee: data.buy.fee
                },
                sell: {
                    index: data.sell.index,
                    token: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
                    fee: data.sell.fee
                },
            }, ethers.utils.parseUnits('2', 8), { gasLimit: process.env.GAS_LIMIT }).catch(console.error)
        }
    }

    console.log(`(${runCounter}) Finished. Awaiting next call.`);
    runCounter++;
}

main();
setInterval(main, 1000 * parseInt(process.env.REQUEST_INTERVAL as string));