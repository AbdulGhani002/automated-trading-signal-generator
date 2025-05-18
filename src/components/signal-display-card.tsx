'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProposeAndValidateTradingSignalOutput, ProposeAndValidateTradingSignalInput } from '@/lib/types';
import { AlertCircle, CheckCircle2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClassValue} from "clsx"; // This import can be removed as cn is imported from utils

interface SignalDisplayCardProps {
  userInput: ProposeAndValidateTradingSignalInput;
  aiOutput: ProposeAndValidateTradingSignalOutput;
}

export function SignalDisplayCard({ userInput, aiOutput }: SignalDisplayCardProps) {
  const { proposedSignal, validationOutcome } = aiOutput;
  const { asset: userAsset, timestamp: userTimestamp } = userInput;

  const { asset, timeframe, entryPrice, tp, sl, reason, timestamp: signalTimestamp } = proposedSignal;
  const { confidenceLevel, reasoning: validationReasoning, isValid } = validationOutcome;

  const formattedUserTimestamp = new Date(userTimestamp).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short', timeZone: 'UTC'
  });

  // Assuming signalTimestamp from proposedSignal is what we want to display for the signal itself
   const formattedSignalTimestamp = new Date(signalTimestamp).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short', timeZone: 'UTC'
  });


  let confidenceBadgeVariant: "default" | "secondary" | "destructive" = "secondary";
  if (confidenceLevel === "High") confidenceBadgeVariant = "default";
  else if (confidenceLevel === "Medium") confidenceBadgeVariant = "secondary";
  else if (confidenceLevel === "Low") confidenceBadgeVariant = "destructive";

  return (
    <Card className="mt-8 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-1">AI Trade Proposal & Validation</CardTitle>
            <CardDescription>User Input: {userAsset} around {formattedUserTimestamp}</CardDescription>
          </div>
          <Badge variant={isValid ? 'default' : 'destructive'} className={cn(
            "text-sm px-3 py-1",
            isValid ? 'bg-accent text-accent-foreground' : ''
          )}>
            {isValid ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : <AlertCircle className="mr-1.5 h-4 w-4" />}
            {isValid ? 'Valid Proposal' : 'Invalid Proposal'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Proposed Signal Section */}
        <div className="p-4 border rounded-lg bg-card/50">
          <div className="flex items-center mb-3">
            <Wand2 className="h-6 w-6 mr-2 text-primary" />
            <h3 className="text-xl font-semibold text-primary">AI's Proposed Signal</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><strong>Asset:</strong> {asset}</div>
            <div><strong>Timeframe:</strong> {timeframe}</div>
            <div><strong>Entry Price:</strong> {entryPrice}</div>
            <div><strong>Take Profit (TP):</strong> {tp}</div>
            <div><strong>Stop Loss (SL):</strong> {sl}</div>
            <div><strong>Signal Timestamp (UTC):</strong> {formattedSignalTimestamp}</div>
          </div>
          <div className="mt-3">
            <h4 className="font-semibold mb-1">AI's Reason for Proposal:</h4>
            <p className="text-muted-foreground bg-muted p-3 rounded-md text-sm">{reason}</p>
          </div>
        </div>

        <hr />

        {/* AI Validation Section */}
        <div className="p-4 border rounded-lg bg-card/50">
          <h3 className="text-xl font-semibold text-primary mb-3">AI's Validation of Proposal</h3>
          <div className="flex items-center mb-2">
            <strong className="mr-2">Confidence Level:</strong>
            <Badge variant={confidenceBadgeVariant} className="text-sm px-2 py-0.5">
              {confidenceLevel}
            </Badge>
          </div>
          <h4 className="font-semibold mt-3 mb-1">AI's Validation Reasoning:</h4>
          <p className="text-muted-foreground bg-secondary p-3 rounded-md text-sm">{validationReasoning}</p>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          This proposal and validation are AI-generated and for informational purposes only. Not financial advice.
        </p>
      </CardFooter>
    </Card>
  );
}
