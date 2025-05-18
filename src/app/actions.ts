
'use server';

import { proposeAndValidateTradingSignal } from '@/ai/flows/propose-and-validate-trading-signal';
import type { ProposeAndValidateTradingSignalInput, ProposeAndValidateTradingSignalOutput } from '@/lib/types';
import { sendDiscordNotification } from '@/services/discord-service';

export async function handleProposeAndValidateSignal(
  data: ProposeAndValidateTradingSignalInput
): Promise<{ success: boolean; data?: ProposeAndValidateTradingSignalOutput; error?: string }> {
  try {
    const result = await proposeAndValidateTradingSignal(data);
    
    // If successful, send notification to Discord (fire and forget)
    if (result) {
      sendDiscordNotification(data, result).catch(err => {
        console.error("Failed to send Discord notification (non-blocking):", err);
      });
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error proposing and validating signal:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}
