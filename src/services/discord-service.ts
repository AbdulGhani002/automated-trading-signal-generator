
'use server';

import type { ProposeAndValidateTradingSignalInput, ProposeAndValidateTradingSignalOutput } from '@/lib/types';

function formatDiscordMessage(
  // userInput is no longer needed for the message format
  aiOutput: ProposeAndValidateTradingSignalOutput 
): string {
  const { proposedSignal } = aiOutput; // isValid is not used in the discord message

  const formattedSignalTimestamp = new Date(proposedSignal.exactTimestamp).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short'
  });

  let message = `AI's Proposed Signal: ${proposedSignal.signalIdentifier}\n`;
  message += `Trade: ${proposedSignal.tradeDirection}\n`;
  message += `Timeframe: ${proposedSignal.timeframe}\n`;
  message += `Entry Price: ${proposedSignal.entryPrice}\n`;
  message += `Stop Loss (SL): ${proposedSignal.sl}\n`;
  message += `Take Profit 1 (TP1): ${proposedSignal.tp1}\n`;
  if (proposedSignal.tp2) {
    message += `Take Profit 2 (TP2): ${proposedSignal.tp2}\n`;
  }
  message += `AI Determined Signal Time (UTC): ${formattedSignalTimestamp}\n`;
  message += `AI's Reason for Proposal:\n${proposedSignal.reason}`;

  return message;
}

export async function sendDiscordNotification(
  userInput: ProposeAndValidateTradingSignalInput, // Keep userInput if needed for other context or logging, though not used in formatDiscordMessage
  aiOutput: ProposeAndValidateTradingSignalOutput
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not set. Skipping Discord notification.');
    return;
  }

  // Only send notification if the AI deems the signal valid internally
  if (!aiOutput.isValid) {
    console.log('AI deemed the signal not strong enough. Skipping Discord notification.');
    return;
  }
  
  const messageContent = formatDiscordMessage(aiOutput);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: messageContent,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error sending Discord notification: ${response.status} ${response.statusText}`, errorBody);
    } else {
      console.log('Successfully sent AI signal to Discord.');
    }
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}
