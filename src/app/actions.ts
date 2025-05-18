
'use server';

import { proposeAndValidateTradingSignal } from '@/ai/flows/propose-and-validate-trading-signal';
// Ensure this matches the updated types from ProposeAndValidateTradingSignalOutput
import type { ProposeAndValidateTradingSignalInput, ProposeAndValidateTradingSignalOutput } from '@/lib/types'; 
import { sendDiscordNotification } from '@/services/discord-service';

export async function handleProposeAndValidateSignal(
  data: ProposeAndValidateTradingSignalInput
): Promise<{ success: boolean; data?: ProposeAndValidateTradingSignalOutput; error?: string }> {
  try {
    const result = await proposeAndValidateTradingSignal(data);
    
    // Send Discord notification if the signal is valid (based on internal AI check)
    // The sendDiscordNotification function itself will now also check result.isValid
    if (result && result.isValid) { 
      sendDiscordNotification(data, result).catch(err => {
        console.error("Failed to send Discord notification (non-blocking):", err);
      });
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error proposing and validating signal:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during AI processing.';
    if (errorMessage.includes("Output failed schema validation")) {
        return { success: false, error: "The AI's response was not in the expected format. Please try adjusting your input or try again later."};
    }
    return { success: false, error: errorMessage };
  }
}
