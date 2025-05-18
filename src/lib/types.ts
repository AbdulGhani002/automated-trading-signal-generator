
import type { 
  ProposeAndValidateTradingSignalInput as AiInput, 
  ProposeAndValidateTradingSignalOutput as AiOutput, // Output structure has changed
  FullProposedSignal as AiFullProposedSignal
} from '@/ai/flows/propose-and-validate-trading-signal';

export type ProposeAndValidateTradingSignalInput = AiInput;
export type ProposeAndValidateTradingSignalOutput = AiOutput; // Will now be { proposedSignal: ProposedSignal; isValid: boolean; }
export type ProposedSignal = AiFullProposedSignal; 

// ValidationOutcome and SignalSummary are no longer part of the direct output to UI/client if they are removed from ProposeAndValidateTradingSignalOutputSchema
// If they are kept for internal use (e.g. isValid flag), they don't need to be exported here unless used elsewhere.

export const timeframes = ["1m", "3m", "5m", "15m", "30m", "1H", "2H", "4H", "6H", "8H", "12H", "1D", "3D", "1W", "1M"] as const;
export type Timeframe = typeof timeframes[number];
