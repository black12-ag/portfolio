import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Users, Minus, Plus } from 'lucide-react';

interface GuestsPickerProps {
  value: number;
  onChange: (guests: number) => void;
  maxGuests?: number;
  className?: string;
  disabled?: boolean;
}

export default function GuestsPicker({
  value,
  onChange,
  maxGuests = 16,
  className,
  disabled = false
}: GuestsPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [adults, setAdults] = useState(Math.max(1, value - Math.floor(value * 0.2)));
  const [children, setChildren] = useState(Math.floor(value * 0.2));

  const totalGuests = adults + children;

  const handleAdultsChange = (newAdults: number) => {
    const validAdults = Math.max(1, Math.min(maxGuests - children, newAdults));
    setAdults(validAdults);
    onChange(validAdults + children);
  };

  const handleChildrenChange = (newChildren: number) => {
    const validChildren = Math.max(0, Math.min(maxGuests - adults, newChildren));
    setChildren(validChildren);
    onChange(adults + validChildren);
  };

  React.useEffect(() => {
    // Update internal state when value changes externally
    const newAdults = Math.max(1, value - Math.floor(value * 0.2));
    const newChildren = Math.floor(value * 0.2);
    setAdults(newAdults);
    setChildren(newChildren);
  }, [value, setAdults, setChildren]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            className
          )}
          disabled={disabled}
        >
          <Users className="mr-2 h-4 w-4" />
          {value} {value === 1 ? 'guest' : 'guests'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Adults</div>
              <div className="text-sm text-muted-foreground">Ages 13+</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleAdultsChange(adults - 1)}
                disabled={adults <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{adults}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleAdultsChange(adults + 1)}
                disabled={adults >= maxGuests - children}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Children</div>
              <div className="text-sm text-muted-foreground">Ages 2-12</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleChildrenChange(children - 1)}
                disabled={children <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{children}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleChildrenChange(children + 1)}
                disabled={children >= maxGuests - adults}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total: {totalGuests} guests</span>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}