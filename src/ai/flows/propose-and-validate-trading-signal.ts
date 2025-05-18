
'use server';
/**
 * @fileOverview This file contains the Genkit flow for proposing trading signals using AI.
 * It generates a signal identifier, trade direction, entry, SL, up to two TPs, reason, timeframe, and exact timestamp.
 * It also internally validates the signal and returns an 'isValid' flag.
 *
 * - proposeAndValidateTradingSignal - A function that proposes a trading signal and includes an internal validity check.
 * - ProposeAndValidateTradingSignalInput - The input type.
 * - ProposeAndValidateTradingSignalOutput - The return type, including a structured signal and a validity flag.
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
  signalIdentifier: z.string().describe('A concise identifier for the signal, often including the asset and a descriptive tag (e.g., "AAPL - Momentum Surge", "EURUSD - Channel Bounce").'),
  timeframe: z.enum(timeframes).describe(`The AI-determined timeframe of the trading signal. Choose from: ${timeframes.join(', ')}`),
  tradeDirection: z.enum(["BUY", "SELL"]).describe('The implied trade direction (BUY or SELL). This should be determined based on whether TP1 is above or below the entry price.'),
  entryPrice: z.number().describe('The AI-determined entry price of the trading signal.'),
  tp1: z.number().describe('The AI-determined first take profit price for the signal.'),
  tp2: z.number().optional().describe('The AI-determined second take profit price for the signal (optional).'),
  sl: z.number().describe('The AI-determined stop loss price for the signal.'),
  reason: z.string().describe('The AI-generated reason for the trading signal (e.g., RSI oversold + Bullish MACD crossover + price bouncing off support). This should be concise.'),
  exactTimestamp: z.string().describe('The AI-determined exact timestamp for the signal (UTC ISO format), which should be around the user-provided approximate timestamp.'),
});

// Schema for the full proposed signal, including original inputs for context
const FullProposedSignalSchema = ProposedSignalParametersSchema.extend({
    asset: z.string().describe('The asset for the trading signal (e.g., AAPL or EUR/USD).'),
});
export type FullProposedSignal = z.infer<typeof FullProposedSignalSchema>;


// Schema for the validation outcome (used internally by the flow)
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


// Output of the entire flow - simplified
const ProposeAndValidateTradingSignalOutputSchema = z.object({
  proposedSignal: FullProposedSignalSchema,
  isValid: z.boolean().describe('Whether the AI internally deemed the signal strong enough to propose (true if confidence is Medium or High).'),
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
  output: {schema: ProposedSignalParametersSchema },
  prompt: `You are an expert trading analyst. Based on the asset {{{asset}}} and the approximate date/time {{{timestamp}}}, propose a promising trading signal.
You MUST determine and output the following:
1.  signalIdentifier: A concise identifier for the signal (e.g., "{{asset}} - Strategy Name").
2.  timeframe: The most suitable timeframe (from options: ${timeframes.join(', ')}).
3.  tradeDirection: "BUY" or "SELL". Determine this based on your analysis; generally, if your TP1 is above entry, it's BUY, if below, it's SELL.
4.  entryPrice: A specific entry price.
5.  tp1: A specific first take profit (TP1) level.
6.  tp2: An optional second take profit (TP2) level. If not applicable, omit it.
7.  sl: A specific stop loss (SL) level.
8.  reason: A concise reason for this signal (technical/fundamental indicators).
9.  exactTimestamp: The exact optimal timestamp (in UTC ISO format) for this signal, around or on the user-provided approximate timestamp.

Ensure the TP/SL levels are reasonable and strategically placed. The user-provided timestamp is a general guide.
Be precise and follow the requested output structure. For example:
Asset: {{{asset}}}
Approximate Timestamp: {{{timestamp}}}
`,
});

// Prompt for validating the signal (internal use)
const validateSignalPrompt = ai.definePrompt({
  name: 'validateGeneratedSignalPromptInternal',
  input: {schema: FullProposedSignalSchema}, 
  output: {schema: ValidationOutcomeSchema},
  prompt: `You are an AI assistant specialized in validating trading signals for financial assets.
  Analyze the following AI-generated trading signal:
  Signal Identifier: {{{signalIdentifier}}}
  Asset: {{{asset}}}
  Timeframe: {{{timeframe}}}
  Trade Direction: {{{tradeDirection}}}
  Entry Price: {{{entryPrice}}}
  Take Profit 1: {{{tp1}}}
  {{#if tp2}}Take Profit 2: {{{tp2}}}{{/if}}
  Stop Loss: {{{sl}}}
  AI-Generated Reason: {{{reason}}}
  Exact Signal Timestamp (UTC): {{{exactTimestamp}}}

  Assess its confidence level (High, Medium, or Low) based on historical success rates under similar market conditions and the strength of indicators.
  Provide detailed reasoning. Indicate if the signal is valid (isValid: true for Medium or High confidence, false for Low). Be conservative.`,
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
    const proposedParams = generationResult.output;

    if (!proposedParams) {
      throw new Error('AI failed to generate trading signal parameters.');
    }

    // Construct the full signal object for validation
    const fullProposedSignal: FullProposedSignal = {
      asset: input.asset, 
      signalIdentifier: proposedParams.signalIdentifier,
      timeframe: proposedParams.timeframe,
      tradeDirection: proposedParams.tradeDirection,
      entryPrice: proposedParams.entryPrice,
      tp1: proposedParams.tp1,
      tp2: proposedParams.tp2,
      sl: proposedParams.sl,
      reason: proposedParams.reason,
      exactTimestamp: proposedParams.exactTimestamp,
    };

    // Step 2: Validate the generated signal (internally)
    const validationResult = await validateSignalPrompt(fullProposedSignal);
    const validationOutcome = validationResult.output;

    if (!validationOutcome) {
      throw new Error('AI failed to internally validate the generated trading signal.');
    }

    return {
      proposedSignal: fullProposedSignal,
      isValid: validationOutcome.isValid,
    };
  }
);
