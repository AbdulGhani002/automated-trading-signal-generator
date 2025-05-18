
'use server';

import type { ProposeAndValidateTradingSignalInput, ProposeAndValidateTradingSignalOutput } from '@/lib/types';

function formatDiscordMessage(
  userInput: ProposeAndValidateTradingSignalInput,
  aiOutput: ProposeAndValidateTradingSignalOutput
): string {
  const { proposedSignal, validationOutcome } = aiOutput;
  const { asset: userAsset, timestamp: userTimestamp } = userInput;

  const formattedUserTimestamp = new Date(userTimestamp).toUTCString();
  const formattedSignalTimestamp = new Date(proposedSignal.timestamp).toUTCString();

  let message = `**New AI Trade Signal & Validation** 🚀\n\n`;
  message += `**User Input:**\n`;
  message += `- Asset: \`${userAsset}\`\n`;
  message += `- Approx. Timestamp (UTC): \`${formattedUserTimestamp}\`\n\n`;

  message += `**🤖 AI Proposed Signal:**\n`;
  message += `- Asset: \`${proposedSignal.asset}\`\n`;
  message += `- Signal Timestamp (UTC): \`${formattedSignalTimestamp}\`\n`;
  message += `- Timeframe: \`${proposedSignal.timeframe}\`\n`;
  message += `- Entry Price: \`${proposedSignal.entryPrice}\`\n`;
  message += `- Take Profit (TP): \`${proposedSignal.tp}\`\n`;
  message += `- Stop Loss (SL): \`${proposedSignal.sl}\`\n`;
  message += `- Reason: \`\`\`${proposedSignal.reason}\`\`\`\n\n`;

  message += `**🧐 AI Validation:**\n`;
  message += `- Confidence: **${validationOutcome.confidenceLevel}** ${validationOutcome.isValid ? '✅ (VALID)' : '❌ (INVALID)'}\n`;
  message += `- Reasoning: \`\`\`${validationOutcome.reasoning}\`\`\`\n\n`;
  message += `*Disclaimer: AI-generated content. Not financial advice.*`;

  return message;
}

export async function sendDiscordNotification(
  userInput: ProposeAndValidateTradingSignalInput,
  aiOutput: ProposeAndValidateTradingSignalOutput
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not set. Skipping Discord notification.');
    return;
  }

  const messageContent = formatDiscordMessage(userInput, aiOutput);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: messageContent,
        // You can add embeds here for a richer message, e.g.:
        // embeds: [{
        //   title: `Signal for ${aiOutput.proposedSignal.asset}`,
        //   description: messageContent,
        //   color: validationOutcome.isValid ? 5814783 : 15548997, // Green for valid, Red for invalid
        // }]
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error sending Discord notification: ${response.status} ${response.statusText}`, errorBody);
    } else {
      console.log('Successfully sent signal to Discord.');
    }
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}
