import { ethers } from 'ethers';
// UniswapV3
import { Pool } from '@uniswap/v3-sdk';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Immutables, State } from './interfaces';

// Get the prices of a uniswapv3 pair contract
export async function uniswapV3Price(cntr: ethers.Contract, token0Decimals: number, token1Decimals: number, exchangeId: number, poolFee: number) {
    // ============ Immutables ============
    const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] = await Promise.all([
        cntr.factory(), cntr.token0(), cntr.token1(), cntr.fee(), cntr.tickSpacing(), cntr.maxLiquidityPerTick()
    ]);
    const immutables: Immutables = { factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick };

    // ============ State ============
    const [liquidity, slot] = await Promise.all([ cntr.liquidity(), cntr.slot0() ]);
    const state: State = {
        liquidity,
        sqrtPriceX96: slot[0],
        tick: slot[1],
        observationIndex: slot[2],
        observationCardinality: slot[3],
        observationCardinalityNext: slot[4],
        feeProtocol: slot[5],
        unlocked: slot[6],
    };

    // ============ Price ============
    const pool = new Pool(
        new Token(3, immutables.token0, token0Decimals),
        new Token(3, immutables.token1, token1Decimals),
        immutables.fee,
        state.sqrtPriceX96.toString(),
        state.liquidity.toString(),
        state.tick
    );

    const token0Amount = CurrencyAmount.fromRawAmount(pool.token0, 10**token0Decimals);
    const token1Amount = CurrencyAmount.fromRawAmount(pool.token1, 10**token1Decimals);

    // ============ Return ============
    return {
        token0_1: parseFloat(pool.token0Price.quote(token0Amount).toExact()) * ((100 - (poolFee / 10000)) / 100),
        token1_0: parseFloat(pool.token1Price.quote(token1Amount).toExact()) * ((100 - (poolFee / 10000)) / 100),
        index: exchangeId,
        poolFee: poolFee
    }
};

// Get the prices of a quickswap pair
export async function uniswapV2Price(cntr: ethers.Contract, exchangeId: number, poolFee: number) {
    const reserves = await cntr.functions.getReserves();

    return {
        token0_1: reserves._reserve1 / reserves._reserve0 * ((100 - (poolFee / 10000)) / 100),
        token1_0: reserves._reserve0 / reserves._reserve1 * ((100 - (poolFee / 10000)) / 100),
        index: exchangeId,
        poolFee: poolFee
    }
};

export function indexToDex(index: number) {
    if (index === 0)
        return 'UniswapV3';
    else if (index === 1)
        return 'Quickswap';
    else if (index === 2)
        return 'Firebird';
}