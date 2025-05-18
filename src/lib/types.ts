
import type { 
  ProposeAndValidateTradingSignalInput as AiInput, 
  ProposeAndValidateTradingSignalOutput as AiOutput,
  FullProposedSignal as AiFullProposedSignal, // Updated name
  ValidationOutcome as AiValidationOutcome,
  SignalSummary as AiSignalSummary
} from '@/ai/flows/propose-and-validate-trading-signal';

export type ProposeAndValidateTradingSignalInput = AiInput;
export type ProposeAndValidateTradingSignalOutput = AiOutput;
export type ProposedSignal = AiFullProposedSignal; // Use the updated name
export type ValidationOutcome = AiValidationOutcome;
export type SignalSummary = AiSignalSummary;

export const timeframes = ["1m", "5m", "15m", "30m", "1H", "2H", "4H", "1D", "1W"] as const; // Added more timeframes
export type Timeframe = typeof timeframes[number];

    