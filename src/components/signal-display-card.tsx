
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProposeAndValidateTradingSignalOutput, ProposeAndValidateTradingSignalInput } from '@/lib/types';
import { Wand2, AlignLeft, TrendingUp, TrendingDown, CalendarClock, Target, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignalDisplayCardProps {
  userInput: ProposeAndValidateTradingSignalInput; // Keep for context if needed, but not displayed
  aiOutput: ProposeAndValidateTradingSignalOutput;
}

function SignalDetailItem({ icon: Icon, label, value, valueClassName }: { icon: React.ElementType, label: string, value: React.ReactNode, valueClassName?: string }) {
  return (
    <div className="flex items-start space-x-2 py-1">
      <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
      <div>
        <span className="font-medium text-muted-foreground">{label}:</span>
        <span className={cn("ml-1 text-foreground", valueClassName)}>{value}</span>
      </div>
    </div>
  );
}

export function SignalDisplayCard({ aiOutput }: SignalDisplayCardProps) {
  const { proposedSignal } = aiOutput;

  const { 
    signalIdentifier, 
    timeframe, 
    tradeDirection, 
    entryPrice, 
    tp1, 
    tp2, 
    sl, 
    reason, 
    exactTimestamp 
  } = proposedSignal;

  const formattedSignalTimestamp = new Date(exactTimestamp).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short'
  });

  const tradeDirectionIcon = tradeDirection === "BUY" ? TrendingUp : TrendingDown;
  const tradeDirectionColor = tradeDirection === "BUY" ? "text-green-600" : "text-red-600";

  return (
    <Card className="mt-8 shadow-xl">
      <CardHeader>
        <div className="flex items-center">
          <Wand2 className="h-7 w-7 mr-2 text-primary" /> 
          <CardTitle className="text-2xl">
            AI's Proposed Signal: <span className="font-semibold">{signalIdentifier}</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <SignalDetailItem icon={tradeDirectionIcon} label="Trade" value={tradeDirection} valueClassName={cn("font-bold", tradeDirectionColor)} />
        <SignalDetailItem icon={CalendarClock} label="Timeframe" value={timeframe} />
        <SignalDetailItem icon={Target} label="Entry Price" value={String(entryPrice)} />
        <SignalDetailItem icon={ShieldAlert} label="Stop Loss (SL)" value={String(sl)} />
        <SignalDetailItem icon={ShieldCheck} label="Take Profit 1 (TP1)" value={String(tp1)} />
        {tp2 && <SignalDetailItem icon={ShieldCheck} label="Take Profit 2 (TP2)" value={String(tp2)} />}
        <SignalDetailItem icon={CalendarClock} label="AI Determined Signal Time (UTC)" value={formattedSignalTimestamp} />
        
        <div className="pt-2">
          <div className="flex items-start space-x-2">
            <AlignLeft className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-muted-foreground">AI's Reason for Proposal:</span>
              <p className="ml-1 text-foreground bg-muted/50 p-2 rounded-md mt-1 text-sm">{reason}</p>
            </div>
          </div>
        </div>
      </CardContent>
      {/* Footer removed as per request */}
    </Card>
  );
}
