
import type { 
  ProposeAndValidateTradingSignalInput as AiInput, 
  ProposeAndValidateTradingSignalOutput as AiOutput,
  FullProposedSignal as AiProposedSignal,
  ValidationOutcome as AiValidationOutcome,
  SignalSummary as AiSignalSummary
} from '@/ai/flows/propose-and-validate-trading-signal';

export type ProposeAndValidateTradingSignalInput = AiInput;
export type ProposeAndValidateTradingSignalOutput = AiOutput;
export type ProposedSignal = AiProposedSignal;
export type ValidationOutcome = AiValidationOutcome;
export type SignalSummary = AiSignalSummary;

export const timeframes = ["1H", "4H", "1D"] as const;
export type Timeframe = typeof timeframes[number];

    