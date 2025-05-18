
'use client';

import { useState } from 'react';
import { SignalInputForm } from '@/components/signal-input-form';
import { SignalDisplayCard } from '@/components/signal-display-card';
import type { ProposeAndValidateTradingSignalOutput, ProposeAndValidateTradingSignalInput } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const [aiResponse, setAiResponse] = useState<ProposeAndValidateTradingSignalOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUserInput, setLastUserInput] = useState<ProposeAndValidateTradingSignalInput | null>(null); 

  const handleFormSubmit = (input: ProposeAndValidateTradingSignalInput) => {
    setLastUserInput(input);
    setAiResponse(null); // Clear previous results
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">AI Trade Advisor</CardTitle>
          <CardDescription>
            Enter an asset and an approximate date/time. Our AI will analyze market conditions,
            propose an optimal trading signal (timeframe, exact time, entry, TP, SL, reason), 
            validate its confidence, and provide a quick summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignalInputForm 
            setAiResponse={setAiResponse}
            setIsLoading={setIsLoading}
            onFormSubmit={handleFormSubmit} // This will pass the user's input for context
          />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed rounded-lg">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-semibold text-primary">AI is Thinking Deeply...</p>
          <p className="text-muted-foreground">Analyzing, proposing, and validating signal. This advanced process may take a moment.</p>
        </div>
      )}

      {aiResponse && lastUserInput && !isLoading && (
        <SignalDisplayCard 
          userInput={lastUserInput} // Pass the user's original input for display context
          aiOutput={aiResponse} 
        />
      )}
    </div>
  );
}

    