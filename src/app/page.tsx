'use client';

import { useState } from 'react';
import { SignalInputForm } from '@/components/signal-input-form';
import { SignalDisplayCard } from '@/components/signal-display-card';
import type { ValidateTradingSignalOutput, ValidateTradingSignalInput } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function HomePage() {
  const [validationResult, setValidationResult] = useState<ValidateTradingSignalOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Store the input that led to the current validationResult
  const [lastSignalInput, setLastSignalInput] = useState<ValidateTradingSignalInput | null>(null); 

  // Wrapper for setValidationResult to also capture the input
  const handleSetValidationResult = (result: ValidateTradingSignalOutput | null, input?: ValidateTradingSignalInput) => {
    setValidationResult(result);
    if (result && input) {
      setLastSignalInput(input);
    } else if (!result) {
      setLastSignalInput(null); // Clear if validation result is cleared
    }
  }
  
  // Modify SignalInputForm to accept a callback that includes the input
  const passInputToParent = (input: ValidateTradingSignalInput) => {
    setLastSignalInput(input);
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Validate Trading Signal</CardTitle>
          <CardDescription>
            Enter the details of your trading signal below. Our AI will analyze its historical success rate
            under similar market conditions to provide a confidence level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignalInputForm 
            setValidationResult={(res) => handleSetValidationResult(res)} // Original form submit handles this logic internally now
            setIsLoading={setIsLoading} 
            // Pass a dummy callback for input or adjust SignalInputForm to call this on successful submission BEFORE AI call
            // For simplicity, SignalInputForm will now internally store the form values upon submission
            // and handleValidateSignal will be called with these values.
            // We will retrieve the form values used for the *current* validationResult via lastSignalInput
          />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed rounded-lg">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-semibold text-primary">AI is Analyzing Your Signal...</p>
          <p className="text-muted-foreground">This might take a few moments. Please wait.</p>
        </div>
      )}

      {validationResult && lastSignalInput && !isLoading && (
        <SignalDisplayCard 
          signalInput={lastSignalInput} // Pass the input that generated this result
          validationResult={validationResult} 
        />
      )}
    </div>
  );
}
