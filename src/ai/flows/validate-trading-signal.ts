'use server';

/**
 * @fileOverview This file contains the Genkit flow for validating trading signals using AI.
 *
 * - validateTradingSignal - A function that validates a trading signal by examining its historical success rate.
 * - ValidateTradingSignalInput - The input type for the validateTradingSignal function.
 * - ValidateTradingSignalOutput - The return type for the validateTradingSignal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateTradingSignalInputSchema = z.object({
  asset: z.string().describe('The asset for the trading signal (e.g., AAPL or EUR/USD).'),
  timeframe: z.string().describe('The timeframe of the trading signal (e.g., 1H, 4H, 1D).'),
  entryPrice: z.number().describe('The entry price of the trading signal.'),
  tp: z.number().describe('The take profit price of the trading signal.'),
  sl: z.number().describe('The stop loss price of the trading signal.'),
  reason: z.string().describe('The reason for the trading signal (e.g., RSI oversold + Bullish MACD crossover + price bouncing off support).'),
  timestamp: z.string().describe('The timestamp of the trading signal (UTC).'),
});
export type ValidateTradingSignalInput = z.infer<typeof ValidateTradingSignalInputSchema>;

const ValidateTradingSignalOutputSchema = z.object({
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
export type ValidateTradingSignalOutput = z.infer<typeof ValidateTradingSignalOutputSchema>;

export async function validateTradingSignal(input: ValidateTradingSignalInput): Promise<ValidateTradingSignalOutput> {
  return validateTradingSignalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateTradingSignalPrompt',
  input: {schema: ValidateTradingSignalInputSchema},
  output: {schema: ValidateTradingSignalOutputSchema},
  prompt: `You are an AI assistant specialized in validating trading signals for financial assets. Your primary goal is to assess the confidence level of a given trading signal based on its historical success rate under similar market conditions.

  Analyze the following trading signal:
  Asset: {{{asset}}}
  Timeframe: {{{timeframe}}}
  Entry Price: {{{entryPrice}}}
  Take Profit: {{{tp}}}
  Stop Loss: {{{sl}}}
  Reason: {{{reason}}}
  Timestamp: {{{timestamp}}}

  Consider the following factors when determining the confidence level:
  - Historical success rate of similar signals (same asset, timeframe, and technical indicators) under comparable market conditions.
  - Strength of the confluence of indicators supporting the signal.
  - Presence of any potential risks or uncertainties that could invalidate the signal.

  Based on your analysis, provide a confidence level (High, Medium, or Low) and a detailed reasoning for your assessment. Also, indicate whether the signal is valid or not. A signal is deemed valid if the confidence level is Medium or High.
  Be conservative in determining the validity of the trading signal.

  Output the confidence level, reasoning, and validity in the following JSON format:
  {
    "confidenceLevel": "[High/Medium/Low]",
    "reasoning": "[Detailed reasoning for the assigned confidence level]",
    "isValid": [true/false]
  }`,
});

const validateTradingSignalFlow = ai.defineFlow(
  {
    name: 'validateTradingSignalFlow',
    inputSchema: ValidateTradingSignalInputSchema,
    outputSchema: ValidateTradingSignalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
