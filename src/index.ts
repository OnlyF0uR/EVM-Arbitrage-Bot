require('dotenv').config()

import { ethers } from 'ethers';
import { uniswapV3Price, uniswapV2Price, poolToDex, poolToRouter, colours, IUniswapV3PoolABI, IUniswapV2PairABI, CntrAbi } from './utils';
import { PriceLookup } from './interfaces';

// ============ Provider ============
const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_PROVIDER as string);

let runCounter = 0;
let oppCounter = 0;
const runMath = async (buyAmount: number, priceList: PriceLookup[]) => {
    // Sort the prices
    priceList.sort((a, b) => b.token0_1 - a.token0_1);

    const tmpList = [];
    for (const [_, value] of Object.entries(priceList)) {
        tmpList.push({ Exchange: await poolToDex(value.pool), "In / Out": value.token0_1, "Out / In": value.token1_0, "PoolFee (%)": value.poolFee / 10000 })
    }
    console.table(tmpList);

    // Identify where to buy and sell
    const buyAt = priceList[0];
    const sellAt = priceList[priceList.length - 1];

    // ========================
    // xToken = TokenIn for BUY
    // yToken = TokenOut for BUY
    // ========================
    console.log(`${colours.FgBlue}============ Swaps ============`);
    console.log(`${colours.FgCyan}First Swap:\n - xToken: ${buyAmount} = yToken: ${buyAmount * buyAt.token0_1}`);
    console.log(`${colours.FgCyan}Second Swap:\n - yToken: ${buyAmount * buyAt.token0_1} = xToken: ${buyAmount * buyAt.token0_1 * sellAt.token1_0}`);

    console.log(`${colours.FgBlue}============ Profit ============`);
    var netProfit = buyAmount - (buyAmount * buyAt.token0_1 * sellAt.token1_0);
    
    // Flashloan premium
    netProfit -= buyAmount * 0.009;
    console.log(`${colours.FgRed}After: FL Premium: ${netProfit}`);
    
    // Padding
    if (parseFloat(process.env.PADDING as string) > 0) {
        netProfit -= netProfit * parseFloat(process.env.PADDING as string);
        console.log(`After: Padding: ${netProfit}`);
    }

    console.log(`${colours.FgBlue}========================\n${colours.FgGreen}Total: ${netProfit}${colours.Reset}\n`);

    // Return null if there is no profit
    if (netProfit <= 0) return null;

    oppCounter++;
    return {
        buy: {
            router: await poolToRouter(buyAt.pool),
            tokenIn: "",
            poolFee: buyAt.poolFee,
            isV3: buyAt.isV3,
        },
        sell: {
            router: await poolToRouter(sellAt.pool),
            tokenIn: "",
            poolFee: sellAt.poolFee,
            isV3: sellAt.isV3,
        }
    }
}

function poolContract(adr: string, abi: any) {
    return new ethers.Contract(adr, abi, provider)
}

async function main() {
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    const cntr = new ethers.Contract(process.env.CONTRACT_ADDRESS as string, CntrAbi, signer);

    // ============ wMATIC/MANA ============
    {
        console.log('wMATIC/MANA');
        const dat: any = await runMath(5000, [
            // https://info.uniswap.org/#/polygon/pools/0x56845fd95C766eCB0ab450fE2D105a19440a6E35
            await uniswapV3Price(poolContract('0x56845fd95C766eCB0ab450fE2D105a19440a6E35', IUniswapV3PoolABI), 18, 18, 3000),
            // https://info.quickswap.exchange/#/pair/0x6b0Ce31eAD9b14c2281D80A5DDE903AB0855313A
            await uniswapV2Price(poolContract('0x6b0Ce31eAD9b14c2281D80A5DDE903AB0855313A', IUniswapV2PairABI), 3000)
        ]);
        if (dat != null) {
            dat.buy["tokenIn"] = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
            dat.sell["tokenIn"] = '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4';

            await cntr.functions.execute(dat, ethers.utils.parseUnits('5000', 18), { gasLimit: process.env.GAS_LIMIT }).catch(console.error);
        }
    }
    
    // ============ wETH/MANA ============
    {
        console.log('wETH/MANA');
        const dat: any = await runMath(0.5, [
            // https://info.uniswap.org/#/polygon/pools/0x28bdd3749bdea624a726ca153de1cb673f459b9d
            await uniswapV3Price(poolContract('0x28bdd3749bdea624a726ca153de1cb673f459b9d', IUniswapV3PoolABI), 18, 18, 3000),
            // https://info.quickswap.exchange/#/pair/0x814b6c10bf752bbbea7bd68e5e65dc28b4f45982
            await uniswapV2Price(poolContract('0x814b6c10bf752bbbea7bd68e5e65dc28b4f45982', IUniswapV2PairABI), 3000)
        ]);
        if (dat != null) {
            dat.buy["tokenIn"] = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619';
            dat.sell["tokenIn"] = '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4';

            await cntr.functions.execute(dat, ethers.utils.parseUnits('0.5', 18), { gasLimit: process.env.GAS_LIMIT }).catch(console.error);
        }
    }

    // ============ wMATIC/AVAX ============
    {
        console.log('wMATIC/AVAX');
        const dat: any = await runMath(800, [
            // https://info.uniswap.org/#/polygon/pools/0xfa3f210cbad19c8b860a256d67a400d616a87c2a
            await uniswapV3Price(poolContract('0xfa3f210cbad19c8b860a256d67a400d616a87c2a', IUniswapV3PoolABI), 18, 18, 3000),
            // https://info.quickswap.exchange/#/pair/0xeb477ae74774b697b5d515ef8ca09e24fee413b5
            await uniswapV2Price(poolContract('0xeb477ae74774b697b5d515ef8ca09e24fee413b5', IUniswapV2PairABI), 3000)
        ]);
        if (dat != null) {
            dat.buy["tokenIn"] = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';
            dat.sell["tokenIn"] = '0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b';

            await cntr.functions.execute(dat, ethers.utils.parseUnits('800', 18), { gasLimit: process.env.GAS_LIMIT }).catch(console.error);
        }
    }

    // ============ USDC/wETH ============
    {
        console.log('USDC/wETH');
        // https://info.quickswap.exchange/#/pair/0x853ee4b2a13f8a742d64c8f088be7ba2131f670d
        const quickSwapData = await uniswapV2Price(poolContract('0x853ee4b2a13f8a742d64c8f088be7ba2131f670d', IUniswapV2PairABI), 3000);
        quickSwapData.token0_1 /= 10**12;
        quickSwapData.token1_0 *= 10**12;

        // ?
        const firebirdData = await uniswapV2Price(poolContract('0x853ee4b2a13f8a742d64c8f088be7ba2131f670d', IUniswapV2PairABI), 3000);
        firebirdData.token0_1 /= 10**12;
        firebirdData.token1_0 *= 10**12;

        const dat: any = await runMath(25000, [
            // https://info.uniswap.org/#/polygon/pools/0x45dda9cb7c25131df268515131f647d726f50608
            await uniswapV3Price(poolContract('0x45dda9cb7c25131df268515131f647d726f50608', IUniswapV3PoolABI), 6, 18, 500),
            quickSwapData,
            firebirdData
        ]);
        if (dat != null) {
            dat.buy["tokenIn"] = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
            dat.sell["tokenIn"] = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619';

            await cntr.functions.execute(dat, ethers.utils.parseUnits('25000', 6), { gasLimit: process.env.GAS_LIMIT }).catch(console.error);
        }
    }

    // ============ wBTC/wETH ============
    {
        console.log('wBTC/wETH');
        // https://info.quickswap.exchange/#/pair/0xdc9232e2df177d7a12fdff6ecbab114e2231198d
        const quickSwapData = await uniswapV2Price(poolContract('0xdc9232e2df177d7a12fdff6ecbab114e2231198d', IUniswapV2PairABI), 3000);
        quickSwapData.token0_1 /= 10**10;
        quickSwapData.token1_0 *= 10**10;

        // ?
        const firebirdData = await uniswapV2Price(poolContract('0x10f525cfbce668815da5142460af0fcfb5163c81', IUniswapV2PairABI), 3000);
        firebirdData.token0_1 /= 10**10;
        firebirdData.token1_0 *= 10**10;

        const dat: any = await runMath(2, [
            // https://info.uniswap.org/#/polygon/pools/0x50eaedb835021e4a108b7290636d62e9765cc6d7
            await uniswapV3Price(poolContract('0x50eaedb835021e4a108b7290636d62e9765cc6d7', IUniswapV3PoolABI), 8, 18, 500),
            quickSwapData,
            firebirdData
        ]);
        if (dat != null) {
            dat.buy["tokenIn"] = '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6';
            dat.sell["tokenIn"] = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619';

            await cntr.functions.execute(dat, ethers.utils.parseUnits('2', 8), { gasLimit: process.env.GAS_LIMIT }).catch(console.error);
        }
    }

    // ============ wMATIC/USDC ============
    // https://info.uniswap.org/#/polygon/pools/0xa374094527e1673a86de625aa59517c5de346d32
    // https://info.quickswap.exchange/#/pair/0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827

    // ============ wMATIC/wETH ============
    // https://info.uniswap.org/#/polygon/pools/0x167384319b41f7094e62f7506409eb38079abff8
    // https://info.quickswap.exchange/#/pair/0xadbf1854e5883eb8aa7baf50705338739e558e5b

    // ============ wMATIC/USDT ============
    // https://info.uniswap.org/#/polygon/pools/0x781067ef296e5c4a4203f81c593274824b7c185d
    // https://info.quickswap.exchange/#/pair/0x604229c960e5cacf2aaeac8be68ac07ba9df81c3

    // ========================
    runCounter++;
    console.log(`(${runCounter}/${oppCounter}) Finished. Awaiting next call.`);
}

main();
setInterval(main, 1000 * parseInt(process.env.REQUEST_INTERVAL as string));