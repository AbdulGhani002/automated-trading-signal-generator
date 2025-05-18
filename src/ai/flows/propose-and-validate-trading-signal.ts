
'use server';
/**
 * @fileOverview This file contains the Genkit flow for proposing and validating trading signals using AI.
 * It now also includes a step to generate a concise summary of the findings.
 *
 * - proposeAndValidateTradingSignal - A function that first proposes a trading signal, then validates it, and finally summarizes it.
 * - ProposeAndValidateTradingSignalInput - The input type for the proposeAndValidateTradingSignal function.
 * - ProposeAndValidateTradingSignalOutput - The return type for the proposeAndValidateTradingSignal function, including a short summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { timeframes } from '@/lib/types';

// Input for the entire flow
const ProposeAndValidateTradingSignalInputSchema = z.object({
  asset: z.string().describe('The asset for the trading signal (e.g., AAPL or EUR/USD).'),
  timestamp: z.string().describe('The approximate date/timestamp for the signal (UTC). AI will determine the optimal trading parameters and exact timing around this point.'),
});
export type ProposeAndValidateTradingSignalInput = z.infer<typeof ProposeAndValidateTradingSignalInputSchema>;

// Schema for the AI-generated signal parameters
const ProposedSignalParametersSchema = z.object({
  timeframe: z.enum(timeframes).describe(`The AI-determined timeframe of the trading signal. Choose from: ${timeframes.join(', ')}`),
  entryPrice: z.number().describe('The AI-determined entry price of the trading signal.'),
  tp: z.number().describe('The AI-determined take profit price for the signal.'),
  sl: z.number().describe('The AI-determined stop loss price for the signal.'),
  reason: z.string().describe('The AI-generated reason for the trading signal (e.g., RSI oversold + Bullish MACD crossover + price bouncing off support).'),
});

// Schema for the full proposed signal, including original inputs for context
const FullProposedSignalSchema = ProposedSignalParametersSchema.extend({
    asset: z.string().describe('The asset for the trading signal (e.g., AAPL or EUR/USD).'),
    timestamp: z.string().describe('The AI-determined exact timestamp of the trading signal (UTC).'), // Note: This timestamp is now what the AI determines as optimal.
});
export type FullProposedSignal = z.infer<typeof FullProposedSignalSchema>;


// Schema for the validation outcome
const ValidationOutcomeSchema = z.object({
  confidenceLevel: z
    .string()
    .describe(
      'The confidence level of the trading signal (e.g., High, Medium, Low) based on historical success rates under similar market conditions.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI’s reasoning for the assigned confidence level, including a summary of the historical success rates considered.'
    ),
  isValid: z.boolean().describe('Whether the signal is deemed valid or not based on the confidence level (Medium or High).'),
});
export type ValidationOutcome = z.infer<typeof ValidationOutcomeSchema>;

// Schema for the summary message
const SignalSummarySchema = z.object({
    shortMessage: z.string().describe('A very concise (1-2 sentences) summary of the trading signal (asset, implied direction) and its validation (confidence, validity). Example: "High confidence BUY signal for AAPL at 175 (TP:180, SL:172). Validated." or "Low confidence SELL signal for EUR/USD. Not validated."')
});
export type SignalSummary = z.infer<typeof SignalSummarySchema>;


// Output of the entire flow
const ProposeAndValidateTradingSignalOutputSchema = z.object({
  proposedSignal: FullProposedSignalSchema,
  validationOutcome: ValidationOutcomeSchema,
  summary: SignalSummarySchema,
});
export type ProposeAndValidateTradingSignalOutput = z.infer<typeof ProposeAndValidateTradingSignalOutputSchema>;


// Exported function to be called by server actions
export async function proposeAndValidateTradingSignal(input: ProposeAndValidateTradingSignalInput): Promise<ProposeAndValidateTradingSignalOutput> {
  return proposeAndValidateTradingSignalFlow(input);
}

// Prompt for generating the signal
const generateSignalPrompt = ai.definePrompt({
  name: 'generateTradingSignalPrompt',
  input: {schema: ProposeAndValidateTradingSignalInputSchema},
  output: {schema: ProposedSignalParametersSchema.extend({ timestamp: z.string().describe('The AI-determined exact timestamp for the signal (UTC ISO format), which should be around the user-provided approximate timestamp.') })}, // AI also determines the exact timestamp now
  prompt: `You are an expert trading analyst. Based on the asset {{{asset}}} and the approximate date/time {{{timestamp}}}, propose a promising trading signal.
You MUST determine the most suitable timeframe (from options: ${timeframes.join(', ')}), a specific entry price, a take profit (TP) level, a stop loss (SL) level, and the exact optimal timestamp (in UTC ISO format) for this signal.
Also, provide a concise reason for this signal based on potential technical or fundamental market conditions you would expect around that time for the given asset.
Ensure the TP/SL levels are reasonable and strategically placed relative to the entry price and chosen timeframe. Be realistic and base your proposal on common trading strategies.
The user-provided timestamp is a general guide; your proposed signal MUST be for a specific point in time (exact timestamp) around or on that date that you deem optimal.
Output the timeframe, entryPrice, tp, sl, reason, and the exact timestamp you determined for the signal.`,
});

// Prompt for validating the signal
const validateSignalPrompt = ai.definePrompt({
  name: 'validateGeneratedSignalPrompt',
  input: {schema: FullProposedSignalSchema},
  output: {schema: ValidationOutcomeSchema},
  prompt: `You are an AI assistant specialized in validating trading signals for financial assets. Your primary goal is to assess the confidence level of a given AI-generated trading signal based on its historical success rate under similar market conditions.

  Analyze the following AI-generated trading signal:
  Asset: {{{asset}}}
  Timeframe: {{{timeframe}}}
  Entry Price: {{{entryPrice}}}
  Take Profit: {{{tp}}}
  Stop Loss: {{{sl}}}
  AI-Generated Reason: {{{reason}}}
  Exact Signal Timestamp (UTC): {{{timestamp}}}

  Consider the following factors when determining the confidence level:
  - Historical success rate of similar signals (same asset, timeframe, and technical indicators as described in the reason) under comparable market conditions around the given timestamp.
  - Strength of the confluence of indicators supporting the signal (as per the AI-generated reason).
  - Presence of any potential risks or uncertainties that could invalidate the signal.
  - The realism and practicality of the proposed entry, TP, and SL levels.

  Based on your analysis, provide a confidence level (High, Medium, or Low) and a detailed reasoning for your assessment. Also, indicate whether the signal is valid or not. A signal is deemed valid if the confidence level is Medium or High.
  Be conservative in determining the validity of the trading signal.`,
});

// Prompt for summarizing the signal and validation
const summarizeSignalPrompt = ai.definePrompt({
    name: 'summarizeSignalAndValidationPrompt',
    input: { schema: z.object({ proposedSignal: FullProposedSignalSchema, validationOutcome: ValidationOutcomeSchema }) },
    output: { schema: SignalSummarySchema },
    prompt: `Based on the following proposed trading signal and its validation, generate a very concise (1-2 sentences) summary message.
This message should be suitable for a quick alert. Include the asset, implied direction (e.g., BUY if TP > entry, SELL if TP < entry), key price levels (entry, TP, SL), confidence, and validity.

Proposed Signal:
Asset: {{{proposedSignal.asset}}}
Timeframe: {{{proposedSignal.timeframe}}}
Entry Price: {{{proposedSignal.entryPrice}}}
Take Profit: {{{proposedSignal.tp}}}
Stop Loss: {{{proposedSignal.sl}}}
Reason: {{{proposedSignal.reason}}}
Exact Signal Timestamp (UTC): {{{proposedSignal.timestamp}}}

Validation Outcome:
Confidence Level: {{{validationOutcome.confidenceLevel}}}
Reasoning: {{{validationOutcome.reasoning}}}
Is Valid: {{{validationOutcome.isValid}}}

Generate the shortMessage.`,
});


// The main flow
const proposeAndValidateTradingSignalFlow = ai.defineFlow(
  {
    name: 'proposeAndValidateTradingSignalFlow',
    inputSchema: ProposeAndValidateTradingSignalInputSchema,
    outputSchema: ProposeAndValidateTradingSignalOutputSchema,
  },
  async (input) => {
    // Step 1: Generate signal parameters including the exact timestamp
    const generationResult = await generateSignalPrompt(input);
    const proposedParamsAndTimestamp = generationResult.output;

    if (!proposedParamsAndTimestamp) {
      throw new Error('AI failed to generate trading signal parameters and exact timestamp.');
    }

    // Construct the full signal object for validation using the AI-determined exact timestamp
    const fullProposedSignal: FullProposedSignal = {
      asset: input.asset, // Keep original asset from user input for clarity
      timestamp: proposedParamsAndTimestamp.timestamp, // Use AI-determined exact timestamp
      timeframe: proposedParamsAndTimestamp.timeframe,
      entryPrice: proposedParamsAndTimestamp.entryPrice,
      tp: proposedParamsAndTimestamp.tp,
      sl: proposedParamsAndTimestamp.sl,
      reason: proposedParamsAndTimestamp.reason,
    };

    // Step 2: Validate the generated signal
    const validationResult = await validateSignalPrompt(fullProposedSignal);
    const validationOutcome = validationResult.output;

    if (!validationOutcome) {
      throw new Error('AI failed to validate the generated trading signal.');
    }

    // Step 3: Generate a concise summary
    const summaryResult = await summarizeSignalPrompt({ proposedSignal: fullProposedSignal, validationOutcome });
    const summary = summaryResult.output;

    if (!summary) {
        throw new Error('AI failed to generate the signal summary.');
    }

    return {
      proposedSignal: fullProposedSignal,
      validationOutcome: validationOutcome,
      summary: summary,
    };
  }
);

    