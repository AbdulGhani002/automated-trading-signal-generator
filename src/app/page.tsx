
'use client';

import { useState } from 'react';
import { SignalInputForm } from '@/components/signal-input-form';
import { SignalDisplayCard } from '@/components/signal-display-card';
import type { ProposeAndValidateTradingSignalOutput, ProposeAndValidateTradingSignalInput } from '@/lib/types';
import { Loader2, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const [aiResponse, setAiResponse] = useState<ProposeAndValidateTradingSignalOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUserInput, setLastUserInput] = useState<ProposeAndValidateTradingSignalInput | null>(null); 

  const handleFormSubmit = (input: ProposeAndValidateTradingSignalInput) => {
    setLastUserInput(input);
    setAiResponse(null); 
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <Wand2 className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-bold">AI Trade Advisor Pro</CardTitle>
          </div>
          <CardDescription className="text-base">
            Provide an asset and an approximate date/time. Our advanced AI will:
            <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
              <li>Generate a unique <span className="font-semibold">Signal Identifier</span>.</li>
              <li>Determine the optimal <span className="font-semibold">Trade Direction (BUY/SELL)</span>.</li>
              <li>Propose precise <span className="font-semibold">Entry, Stop Loss, and up to two Take Profit levels</span>.</li>
              <li>Select an appropriate <span className="font-semibold">Timeframe</span> and <span className="font-semibold">Exact Signal Timestamp</span>.</li>
              <li>Provide a <span className="font-semibold">Reason</span> for the proposal.</li>
            </ul>
             (The AI internally assesses signal strength before proposing.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignalInputForm 
            setAiResponse={setAiResponse}
            setIsLoading={setIsLoading}
            onFormSubmit={handleFormSubmit} 
          />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed rounded-lg bg-card/50">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-semibold text-primary">AI is Strategizing...</p>
          <p className="text-muted-foreground">Crafting a detailed trade proposal. This may take a moment.</p>
        </div>
      )}

      {aiResponse && lastUserInput && !isLoading && aiResponse.isValid && ( // Only display if AI deems it valid
        <SignalDisplayCard 
          userInput={lastUserInput} 
          aiOutput={aiResponse} 
        />
      )}
      
      {aiResponse && !aiResponse.isValid && !isLoading && ( // Message if AI doesn't find a strong signal
         <Card className="mt-8 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center">
                <Wand2 className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-lg font-semibold text-muted-foreground">No Strong Signal Found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The AI analyzed {lastUserInput?.asset} for the specified period but did not identify a high-confidence trading signal at this time.
                </p>
              </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
