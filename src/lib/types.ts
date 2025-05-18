import type { ValidateTradingSignalInput as AiInput, ValidateTradingSignalOutput as AiOutput } from '@/ai/flows/validate-trading-signal';

export type ValidateTradingSignalInput = AiInput;
export type ValidateTradingSignalOutput = AiOutput;

export const timeframes = ["1H", "4H", "1D"] as const;
export type Timeframe = typeof timeframes[number];
