
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Dispatch, type SetStateAction } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleProposeAndValidateSignal } from '@/app/actions';
import type { ProposeAndValidateTradingSignalInput, ProposeAndValidateTradingSignalOutput } from '@/lib/types';
import { z as zod } from 'zod';

const formSchema = zod.object({
  asset: zod.string().min(1, 'Asset is required.'),
  timestamp: zod.date({ required_error: 'Timestamp is required.' }),
});

type SignalFormValues = z.infer<typeof formSchema>;

interface SignalInputFormProps {
  setAiResponse: Dispatch<SetStateAction<ProposeAndValidateTradingSignalOutput | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  onFormSubmit: (input: ProposeAndValidateTradingSignalInput) => void;
}

export function SignalInputForm({ setAiResponse, setIsLoading, onFormSubmit }: SignalInputFormProps) {
  const { toast } = useToast();
  const form = useForm<SignalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset: '',
      timestamp: new Date(),
    },
  });

  async function onSubmit(values: SignalFormValues) {
    setIsLoading(true);
    setAiResponse(null);

    const inputForAI: ProposeAndValidateTradingSignalInput = {
      ...values,
      timestamp: values.timestamp.toISOString(),
    };

    onFormSubmit(inputForAI); 

    const result = await handleProposeAndValidateSignal(inputForAI);

    if (result.success && result.data) {
      setAiResponse(result.data);
      if (result.data.isValid) {
        toast({
          title: 'AI Proposal Generated',
          description: `AI has proposed a signal for ${result.data.proposedSignal.asset}.`,
        });
      } else {
        toast({
          variant: 'default', // Or 'destructive' if you prefer more emphasis
          title: 'AI Analysis Complete',
          description: `AI analyzed ${inputForAI.asset} but did not identify a strong trading signal at this time.`,
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'AI Processing Failed',
        description: result.error || 'Could not get AI proposal and validation.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="asset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset (e.g., AAPL, EUR/USD)</FormLabel>
              <FormControl>
                <Input placeholder="AAPL" {...field} />
              </FormControl>
              <FormDescription>
                Enter the financial asset you are interested in.
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
              <FormLabel>Approximate Date/Time (UTC)</FormLabel>
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
              <FormDescription>
                AI will propose a signal around this date and time.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting || setIsLoading === undefined}>
          {(form.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Get AI Trade Proposal
        </Button>
      </form>
    </Form>
  );
}
