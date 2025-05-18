'use client';

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleValidateSignal } from '@/app/actions';
import type { ValidateTradingSignalInput, ValidateTradingSignalOutput, Timeframe } from '@/lib/types';
import { timeframes } from '@/lib/types';
import { z as zod } from 'zod'; // Use a different alias to avoid conflict with type import

const formSchema = zod.object({
  asset: zod.string().min(1, 'Asset is required.'),
  timeframe: zod.enum(timeframes, { required_error: 'Timeframe is required.' }),
  entryPrice: zod.coerce.number().positive('Entry price must be positive.'),
  tp: zod.coerce.number().positive('Take profit must be positive.'),
  sl: zod.coerce.number().positive('Stop loss must be positive.'),
  reason: zod.string().min(1, 'Reason is required.'),
  timestamp: zod.date({ required_error: 'Timestamp is required.' }),
});

type SignalFormValues = z.infer<typeof formSchema>;

interface SignalInputFormProps {
  setValidationResult: Dispatch<SetStateAction<ValidateTradingSignalOutput | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export function SignalInputForm({ setValidationResult, setIsLoading }: SignalInputFormProps) {
  const { toast } = useToast();
  const form = useForm<SignalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset: '',
      timeframe: '1H',
      entryPrice: undefined,
      tp: undefined,
      sl: undefined,
      reason: '',
      timestamp: new Date(),
    },
  });

  async function onSubmit(values: SignalFormValues) {
    setIsLoading(true);
    setValidationResult(null);

    const inputForAI: ValidateTradingSignalInput = {
      ...values,
      timestamp: values.timestamp.toISOString(),
    };

    const result = await handleValidateSignal(inputForAI);

    if (result.success && result.data) {
      setValidationResult(result.data);
      toast({
        title: 'Signal Validated',
        description: `AI confidence: ${result.data.confidenceLevel}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Validation Failed',
        description: result.error || 'Could not validate the signal.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="asset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset (e.g., AAPL, EUR/USD)</FormLabel>
                <FormControl>
                  <Input placeholder="AAPL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timeframe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timeframe</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timeframe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeframes.map((tf) => (
                      <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="entryPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Price</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="129.32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Take Profit (TP)</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="135.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stop Loss (SL)</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="126.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Signal</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="RSI oversold + Bullish MACD crossover + price bouncing off support"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the technical indicators and conditions supporting this signal.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timestamp"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Timestamp (UTC)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP HH:mm:ss")
                      ) : (
                        <span>Pick a date and time</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        const originalDate = field.value || new Date();
                        date.setHours(originalDate.getHours());
                        date.setMinutes(originalDate.getMinutes());
                        date.setSeconds(originalDate.getSeconds());
                        field.onChange(date);
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                  {/* Basic time input for simplicity, ideally use a time picker component */}
                  <div className="p-2 border-t border-border">
                    <Input
                      type="time"
                      step="1"
                      value={field.value ? format(field.value, "HH:mm:ss") : ""}
                      onChange={(e) => {
                        const timeParts = e.target.value.split(':');
                        const newDate = field.value ? new Date(field.value) : new Date();
                        newDate.setHours(parseInt(timeParts[0] || "0", 10));
                        newDate.setMinutes(parseInt(timeParts[1] || "0", 10));
                        newDate.setSeconds(parseInt(timeParts[2] || "0", 10));
                        field.onChange(newDate);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Validate Signal with AI
        </Button>
      </form>
    </Form>
  );
}
