import { BigNumber, Contract } from 'ethers';

export interface Immutables {
    factory: string;
    token0: string;
    token1: string;
    fee: number;
    tickSpacing: number;
    maxLiquidityPerTick: BigNumber;
};

export interface State {
    liquidity: BigNumber;
    sqrtPriceX96: BigNumber;
    tick: number;
    observationIndex: number;
    observationCardinality: number;
    observationCardinalityNext: number;
    feeProtocol: number;
    unlocked: boolean;
};

export interface PriceLookup {
    token0_1: number,
    token1_0: number,
    index: number,
    poolFee: number
}