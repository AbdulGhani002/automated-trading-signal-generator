'use server';

import { validateTradingSignal } from '@/ai/flows/validate-trading-signal';
import type { ValidateTradingSignalInput, ValidateTradingSignalOutput } from '@/lib/types';

export async function handleValidateSignal(
  data: ValidateTradingSignalInput
): Promise<{ success: boolean; data?: ValidateTradingSignalOutput; error?: string }> {
  try {
    const result = await validateTradingSignal(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error validating signal:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}
