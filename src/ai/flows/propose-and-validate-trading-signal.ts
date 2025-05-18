'use server';
/**
 * @fileOverview This file contains the Genkit flow for proposing and validating trading signals using AI.
 *
 * - proposeAndValidateTradingSignal - A function that first proposes a trading signal based on asset and timestamp, then validates it.
 * - ProposeAndValidateTradingSignalInput - The input type for the proposeAndValidateTradingSignal function.
 * - ProposeAndValidateTradingSignalOutput - The return type for the proposeAndValidateTradingSignal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { timeframes } from '@/lib/types';

// Input for the entire flow
const ProposeAndValidateTradingSignalInputSchema = z.object({
  asset: z.string().describe('The asset for the trading signal (e.g., AAPL or EUR/USD).'),
  timestamp: z.string().describe('The approximate date/timestamp for the signal (UTC). AI will determine the optimal trading parameters around this time.'),
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
    timestamp: z.string().describe('The timestamp of the trading signal (UTC), corresponding to the user\'s initial input.'),
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
  isValid: z.boolean().describe('Whether the signal is deemed valid or not based on the confidence level.'),
});
export type ValidationOutcome = z.infer<typeof ValidationOutcomeSchema>;


// Output of the entire flow
const ProposeAndValidateTradingSignalOutputSchema = z.object({
  proposedSignal: FullProposedSignalSchema,
  validationOutcome: ValidationOutcomeSchema,
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
  output: {schema: ProposedSignalParametersSchema},
  prompt: `You are an expert trading analyst. Based on the asset {{{asset}}} and the approximate date/time {{{timestamp}}}, propose a promising trading signal.
Determine the most suitable timeframe (from options: ${timeframes.join(', ')}), a specific entry price, a take profit (TP) level, and a stop loss (SL) level.
Also, provide a concise reason for this signal based on potential technical or fundamental market conditions you would expect around that time for the given asset.
Ensure the TP/SL levels are reasonable and strategically placed relative to the entry price and chosen timeframe. Be realistic and base your proposal on common trading strategies.
The timestamp provided is a general guide; your proposed signal should be for a specific point in time around or on that date that you deem optimal.
Output the timeframe, entryPrice, tp, sl, and reason.`,
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
  Timestamp: {{{timestamp}}}

  Consider the following factors when determining the confidence level:
  - Historical success rate of similar signals (same asset, timeframe, and technical indicators as described in the reason) under comparable market conditions around the given timestamp.
  - Strength of the confluence of indicators supporting the signal (as per the AI-generated reason).
  - Presence of any potential risks or uncertainties that could invalidate the signal.
  - The realism and practicality of the proposed entry, TP, and SL levels.

  Based on your analysis, provide a confidence level (High, Medium, or Low) and a detailed reasoning for your assessment. Also, indicate whether the signal is valid or not. A signal is deemed valid if the confidence level is Medium or High.
  Be conservative in determining the validity of the trading signal.`,
});

// The main flow
const proposeAndValidateTradingSignalFlow = ai.defineFlow(
  {
    name: 'proposeAndValidateTradingSignalFlow',
    inputSchema: ProposeAndValidateTradingSignalInputSchema,
    outputSchema: ProposeAndValidateTradingSignalOutputSchema,
  },
  async (input) => {
    // Step 1: Generate signal parameters
    const generationResult = await generateSignalPrompt(input);
    const proposedParams = generationResult.output;

    if (!proposedParams) {
      throw new Error('AI failed to generate trading signal parameters.');
    }

    // Construct the full signal object for validation
    const fullProposedSignal: FullProposedSignal = {
      asset: input.asset,
      timestamp: input.timestamp, // Pass the original timestamp for context in validation
      timeframe: proposedParams.timeframe,
      entryPrice: proposedParams.entryPrice,
      tp: proposedParams.tp,
      sl: proposedParams.sl,
      reason: proposedParams.reason,
    };

    // Step 2: Validate the generated signal
    const validationResult = await validateSignalPrompt(fullProposedSignal);
    const validationOutcome = validationResult.output;

    if (!validationOutcome) {
      throw new Error('AI failed to validate the generated trading signal.');
    }

    return {
      proposedSignal: fullProposedSignal,
      validationOutcome: validationOutcome,
    };
  }
);
