
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProposeAndValidateTradingSignalOutput, ProposeAndValidateTradingSignalInput, ProposedSignal } from '@/lib/types';
import { AlertCircle, CheckCircle2, Wand2, MessageSquareQuote, AlignLeft, TrendingUp, TrendingDown, CalendarClock, Info, ShieldCheck, ShieldAlert, Target, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignalDisplayCardProps {
  userInput: ProposeAndValidateTradingSignalInput;
  aiOutput: ProposeAndValidateTradingSignalOutput;
}

function SignalDetailItem({ icon: Icon, label, value, valueClassName }: { icon: React.ElementType, label: string, value: React.ReactNode, valueClassName?: string }) {
  return (
    <div className="flex items-start space-x-2 py-1.5">
      <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
      <div>
        <span className="font-medium text-muted-foreground">{label}:</span>
        <span className={cn("ml-1 text-foreground", valueClassName)}>{value}</span>
      </div>
    </div>
  );
}


export function SignalDisplayCard({ userInput, aiOutput }: SignalDisplayCardProps) {
  const { proposedSignal, validationOutcome, summary } = aiOutput;
  const { asset: userAsset, timestamp: userTimestamp } = userInput;

  const { 
    signalIdentifier, 
    asset, 
    timeframe, 
    tradeDirection, 
    entryPrice, 
    tp1, 
    tp2, 
    sl, 
    reason, 
    exactTimestamp 
  } = proposedSignal;

  const formattedUserTimestamp = new Date(userTimestamp).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short'
  });

  const formattedSignalTimestamp = new Date(exactTimestamp).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short'
  });

  let confidenceBadgeVariant: "default" | "secondary" | "destructive" = "secondary";
  if (validationOutcome.confidenceLevel === "High") confidenceBadgeVariant = "default";
  else if (validationOutcome.confidenceLevel === "Medium") confidenceBadgeVariant = "secondary";
  else if (validationOutcome.confidenceLevel === "Low") confidenceBadgeVariant = "destructive";

  const tradeDirectionIcon = tradeDirection === "BUY" ? TrendingUp : TrendingDown;
  const tradeDirectionColor = tradeDirection === "BUY" ? "text-green-600" : "text-red-600";

  return (
    <Card className="mt-8 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-1 flex items-center">
              <Wand2 className="h-7 w-7 mr-2 text-primary" /> 
              AI Trade Proposal & Validation
            </CardTitle>
            <CardDescription>User Input: {userAsset} around {formattedUserTimestamp}</CardDescription>
          </div>
          <Badge variant={validationOutcome.isValid ? 'default' : 'destructive'} className={cn(
            "text-sm px-3 py-1",
            validationOutcome.isValid ? 'bg-accent text-accent-foreground' : ''
          )}>
            {validationOutcome.isValid ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : <AlertCircle className="mr-1.5 h-4 w-4" />}
            {validationOutcome.isValid ? 'Valid Proposal' : 'Invalid Proposal'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Short Summary Section */}
        {summary && summary.shortMessage && (
          <div className="p-4 border rounded-lg bg-primary/5">
            <div className="flex items-center mb-2">
              <MessageSquareQuote className="h-6 w-6 mr-2 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Quick Summary</h3>
            </div>
            <p className="text-foreground italic text-sm">{summary.shortMessage}</p>
          </div>
        )}
        
        <hr />

        {/* AI Proposed Signal Section */}
        <div className="p-4 border rounded-lg bg-card/50">
          <div className="flex items-center mb-3">
             <Info className="h-6 w-6 mr-2 text-primary" />
            <h3 className="text-xl font-semibold text-primary">AI's Proposed Signal: <span className="font-bold">{signalIdentifier}</span></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <SignalDetailItem icon={tradeDirectionIcon} label="Trade" value={tradeDirection} valueClassName={cn("font-bold", tradeDirectionColor)} />
            <SignalDetailItem icon={CalendarClock} label="Timeframe" value={timeframe} />
            <SignalDetailItem icon={Target} label="Entry Price" value={String(entryPrice)} />
            <SignalDetailItem icon={ShieldAlert} label="Stop Loss (SL)" value={String(sl)} />
            <SignalDetailItem icon={ShieldCheck} label="Take Profit 1 (TP1)" value={String(tp1)} />
            {tp2 && <SignalDetailItem icon={ShieldCheck} label="Take Profit 2 (TP2)" value={String(tp2)} />}
          </div>
           <div className="mt-2">
             <SignalDetailItem icon={CalendarClock} label="AI Determined Signal Time (UTC)" value={formattedSignalTimestamp} />
           </div>
          <div className="mt-4">
            <div className="flex items-center mb-1">
              <AlignLeft className="h-5 w-5 mr-2 text-primary" />
              <h4 className="font-semibold text-primary">AI's Reason for Proposal:</h4>
            </div>
            <p className="text-muted-foreground bg-muted p-3 rounded-md text-sm">{reason}</p>
          </div>
        </div>

        <hr />

        {/* AI Validation Section */}
        <div className="p-4 border rounded-lg bg-card/50">
           <div className="flex items-center mb-3">
            <HelpCircle className="h-6 w-6 mr-2 text-primary" />
            <h3 className="text-xl font-semibold text-primary">AI's Validation Details</h3>
          </div>
          <div className="flex items-center mb-2">
            <strong className="mr-2 text-muted-foreground">Confidence Level:</strong>
            <Badge variant={confidenceBadgeVariant} className="text-sm px-2 py-0.5">
              {validationOutcome.confidenceLevel}
            </Badge>
          </div>
          <div className="mt-4">
            <div className="flex items-center mb-1">
              <AlignLeft className="h-5 w-5 mr-2 text-primary" />
              <h4 className="font-semibold text-primary">AI's Validation Reasoning:</h4>
            </div>
            <p className="text-muted-foreground bg-secondary p-3 rounded-md text-sm">{validationOutcome.reasoning}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Trading involves risks. Please consider your own risk tolerance and financial situation. Past performance is not indicative of future results.
        </p>
      </CardFooter>
    </Card>
  );
}

    