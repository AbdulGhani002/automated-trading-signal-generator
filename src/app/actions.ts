
'use server';

import { proposeAndValidateTradingSignal } from '@/ai/flows/propose-and-validate-trading-signal';
import type { ProposeAndValidateTradingSignalInput, ProposeAndValidateTradingSignalOutput } from '@/lib/types'; // Ensure this matches the updated types
import { sendDiscordNotification } from '@/services/discord-service';

export async function handleProposeAndValidateSignal(
  data: ProposeAndValidateTradingSignalInput
): Promise<{ success: boolean; data?: ProposeAndValidateTradingSignalOutput; error?: string }> {
  try {
    const result = await proposeAndValidateTradingSignal(data);
    
    if (result) {
      // Fire and forget Discord notification
      sendDiscordNotification(data, result).catch(err => { // Pass original user input 'data' for context
        console.error("Failed to send Discord notification (non-blocking):", err);
      });
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error proposing and validating signal:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during AI processing.';
    // Check for specific Genkit error messages that might be too verbose for users
    if (errorMessage.includes("Output failed schema validation")) {
        return { success: false, error: "The AI's response was not in the expected format. Please try adjusting your input or try again later."};
    }
    return { success: false, error: errorMessage };
  }
}

    