'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ValidateTradingSignalOutput, ValidateTradingSignalInput } from '@/lib/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface SignalDisplayCardProps {
  signalInput: ValidateTradingSignalInput | null; // Keep original input for display
  validationResult: ValidateTradingSignalOutput;
}

export function SignalDisplayCard({ signalInput, validationResult }: SignalDisplayCardProps) {
  if (!signalInput) return null;

  const { asset, timeframe, entryPrice, tp, sl, reason, timestamp: inputTimestamp } = signalInput;
  const { confidenceLevel, reasoning, isValid } = validationResult;

  const formattedTimestamp = new Date(inputTimestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
    timeZone: 'UTC'
  });
  
  // Determine badge variant based on confidence
  let confidenceBadgeVariant: "default" | "secondary" | "destructive" = "secondary";
  if (confidenceLevel === "High") confidenceBadgeVariant = "default"; // Primary color (often green-ish via accent or custom)
  else if (confidenceLevel === "Medium") confidenceBadgeVariant = "secondary"; // Neutral
  else if (confidenceLevel === "Low") confidenceBadgeVariant = "destructive"; // Red-ish

  // If using accent for 'High', we might need a custom class for green
  // For now, 'default' (primary) for High, 'secondary' for Medium, 'destructive' for Low.

  return (
    <Card className="mt-8 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-1">AI Signal Validation Result</CardTitle>
            <CardDescription>Asset: {asset} ({timeframe})</CardDescription>
          </div>
          <Badge variant={isValid ? 'default' : 'destructive'} className={cn(
            "text-sm px-3 py-1",
            isValid ? 'bg-accent text-accent-foreground' : '' // Use accent for valid
          )}>
            {isValid ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : <AlertCircle className="mr-1.5 h-4 w-4" />}
            {isValid ? 'Valid Signal' : 'Invalid Signal'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Entry Price:</strong> {entryPrice}</div>
          <div><strong>Take Profit (TP):</strong> {tp}</div>
          <div><strong>Stop Loss (SL):</strong> {sl}</div>
          <div><strong>Timestamp (UTC):</strong> {formattedTimestamp}</div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-1">Original Signal Reason:</h4>
          <p className="text-muted-foreground bg-muted p-3 rounded-md text-sm">{reason}</p>
        </div>

        <hr className="my-4" />

        <div>
          <h4 className="font-semibold mb-2 text-lg">AI Analysis:</h4>
          <div className="flex items-center mb-2">
            <strong className="mr-2">Confidence Level:</strong>
            <Badge variant={confidenceBadgeVariant} className="text-sm px-2 py-0.5">
              {confidenceLevel}
            </Badge>
          </div>
          <h5 className="font-semibold mt-3 mb-1">AI Reasoning:</h5>
          <p className="text-muted-foreground bg-secondary p-3 rounded-md text-sm">{reasoning}</p>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          This validation is AI-generated and for informational purposes only. Not financial advice.
        </p>
      </CardFooter>
    </Card>
  );
}

// Helper for cn if not globally available in this specific context (though it should be)
// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

