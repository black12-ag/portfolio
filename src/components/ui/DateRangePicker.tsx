import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange as ReactDateRange } from 'react-day-picker';

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function DateRangePicker({
  value,
  onChange,
  placeholder = "Select dates",
  className,
  disabled = false
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range: ReactDateRange | undefined) => {
    if (range) {
      onChange({
        from: range.from || null,
        to: range.to || null
      });
      
      // Close popover when both dates are selected
      if (range.from && range.to) {
        setIsOpen(false);
      }
    }
  };

  const formatDateRange = () => {
    if (!value.from && !value.to) {
      return placeholder;
    }
    
    if (value.from && !value.to) {
      return format(value.from, 'MMM dd, yyyy');
    }
    
    if (value.from && value.to) {
      return `${format(value.from, 'MMM dd')} - ${format(value.to, 'MMM dd, yyyy')}`;
    }
    
    return placeholder;
  };

  const dateRange: ReactDateRange = {
    from: value.from || undefined,
    to: value.to || undefined
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value.from && !value.to && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
          disabled={(date) => date < new Date()}
          numberOfMonths={2}
          initialFocus
          className="rounded-md border"
        />
        <div className="p-3 border-t">
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChange({ from: null, to: null });
                setIsOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={!value.from || !value.to}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}