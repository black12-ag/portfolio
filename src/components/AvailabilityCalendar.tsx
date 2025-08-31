import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { availabilityService, type PropertyAvailability, type AvailabilityRequest } from '@/lib/availabilityService';

interface AvailabilityCalendarProps {
  propertyId: string;
  onDateSelect?: (dates: { from: Date; to: Date } | undefined) => void;
  selectedDates?: { from: Date; to: Date };
  guests?: number;
  showPricing?: boolean;
  showBookings?: boolean;
  className?: string;
}

interface DayInfo {
  date: Date;
  available: boolean;
  price?: number;
  hasBooking: boolean;
  isSelected: boolean;
  isInRange: boolean;
  conflicts: number;
}

export default function AvailabilityCalendar({
  propertyId,
  onDateSelect,
  selectedDates,
  guests = 2,
  showPricing = true,
  showBookings = true,
  className = ''
}: AvailabilityCalendarProps) {
  const { formatPrice } = useCurrency();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [propertyAvailability, setPropertyAvailability] = useState<PropertyAvailability | null>(null);
  const [availabilityData, setAvailabilityData] = useState<Record<string, DayInfo>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ from: Date; to: Date } | undefined>(selectedDates);

  // Load property availability data
  useEffect(() => {
    const loadAvailability = () => {
      const availability = availabilityService.getPropertyAvailability(propertyId);
      setPropertyAvailability(availability);
    };

    loadAvailability();
    
    // Subscribe to real-time updates
    const unsubscribe = availabilityService.subscribeToAvailability(propertyId, loadAvailability);
    return unsubscribe;
  }, [propertyId]);

  // Generate calendar data for current month
  useEffect(() => {
    const generateCalendarData = async () => {
      if (!propertyAvailability) return;
      
      setIsLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        const dayData: Record<string, DayInfo> = {};

        // Generate data for each day in the month
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dateKey = date.toISOString().split('T')[0];
          const currentDate = new Date(date);

          // Check if this day has any bookings
          const dayBookings = propertyAvailability.conflicts.filter(booking => {
            const bookingStart = new Date(booking.checkIn);
            const bookingEnd = new Date(booking.checkOut);
            return currentDate >= bookingStart && currentDate < bookingEnd;
          });

          // Check availability for a 1-night stay starting this day
          let available = true;
          let price = propertyAvailability.pricing.basePrice;

          try {
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            const availabilityCheck = await availabilityService.checkAvailability({
              propertyId,
              checkIn: currentDate,
              checkOut: nextDay,
              guests
            });
            
            available = availabilityCheck.available;
            price = availabilityCheck.pricing.basePrice;
          } catch (error) {
            available = dayBookings.length === 0;
          }

          // Check if day is in selected range
          const isSelected = selectedRange && 
            currentDate >= selectedRange.from && 
            currentDate <= selectedRange.to;

          const isInRange = selectedRange && selectedRange.from && selectedRange.to &&
            currentDate > selectedRange.from && 
            currentDate < selectedRange.to;

          dayData[dateKey] = {
            date: currentDate,
            available,
            price: showPricing ? price : undefined,
            hasBooking: dayBookings.length > 0,
            isSelected: !!isSelected,
            isInRange: !!isInRange,
            conflicts: dayBookings.length
          };
        }

        setAvailabilityData(dayData);
      } catch (error) {
        console.error('Failed to generate calendar data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateCalendarData();
  }, [currentMonth, propertyAvailability, selectedRange, propertyId, guests, showPricing]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateClick = (date: Date) => {
    if (!selectedRange?.from || (selectedRange.from && selectedRange.to)) {
      // Start new selection
      const newRange = { from: date, to: date };
      setSelectedRange(newRange);
      onDateSelect?.(newRange);
    } else if (selectedRange.from && !selectedRange.to) {
      // Complete selection
      const from = selectedRange.from;
      const to = date > from ? date : from;
      const newRange = { from: date > from ? from : date, to };
      setSelectedRange(newRange);
      onDateSelect?.(newRange);
    }
  };

  const clearSelection = () => {
    setSelectedRange(undefined);
    onDateSelect?.(undefined);
  };

  const getDayClassName = (dayInfo: DayInfo): string => {
    const classes = ['relative', 'w-full', 'h-full', 'p-1', 'text-center', 'cursor-pointer', 'transition-colors'];
    
    if (!dayInfo.available) {
      classes.push('bg-red-100', 'text-red-800', 'cursor-not-allowed');
    } else if (dayInfo.hasBooking) {
      classes.push('bg-orange-100', 'text-orange-800');
    } else {
      classes.push('bg-green-50', 'text-green-800', 'hover:bg-green-100');
    }

    if (dayInfo.isSelected) {
      classes.push('bg-primary', 'text-primary-foreground');
    } else if (dayInfo.isInRange) {
      classes.push('bg-primary/20');
    }

    return classes.join(' ');
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const summary = useMemo(() => {
    const days = Object.values(availabilityData);
    return {
      total: days.length,
      available: days.filter(d => d.available).length,
      booked: days.filter(d => d.hasBooking).length,
      blocked: days.filter(d => !d.available && !d.hasBooking).length
    };
  }, [availabilityData]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Availability Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[120px] text-center font-medium">{monthName}</span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Month Summary */}
        <div className="flex gap-2 text-sm">
          <Badge variant="outline" className="text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            {summary.available} Available
          </Badge>
          <Badge variant="outline" className="text-orange-600">
            <Clock className="h-3 w-3 mr-1" />
            {summary.booked} Booked
          </Badge>
          {summary.blocked > 0 && (
            <Badge variant="outline" className="text-red-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              {summary.blocked} Blocked
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Guest Selection */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm">Guests:</span>
          <Select value={guests.toString()} onValueChange={(value) => {
            // This would trigger a re-calculation of availability
            console.log('Guests changed to:', value);
          }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for start of month */}
                {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }, (_, i) => (
                  <div key={`empty-${i}`} className="h-16"></div>
                ))}

                {/* Actual days */}
                {Object.values(availabilityData).map(dayInfo => {
                  const dateKey = dayInfo.date.toISOString().split('T')[0];
                  return (
                    <div
                      key={dateKey}
                      className={`h-16 border rounded ${getDayClassName(dayInfo)}`}
                      onClick={() => dayInfo.available && handleDateClick(dayInfo.date)}
                    >
                      <div className="text-sm font-medium">
                        {dayInfo.date.getDate()}
                      </div>
                      {showPricing && dayInfo.price && dayInfo.available && (
                        <div className="text-xs">
                          {formatPrice(dayInfo.price)}
                        </div>
                      )}
                      {dayInfo.conflicts > 0 && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {selectedRange && selectedRange.from && selectedRange.to && (
          <Alert>
            <CalendarDays className="h-4 w-4" />
            <AlertDescription>
              Selected: {selectedRange.from.toLocaleDateString()} - {selectedRange.to.toLocaleDateString()}
              {showPricing && (
                <span className="ml-2">
                  ({Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24))} nights)
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {selectedRange && (
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border rounded"></div>
            Available
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-100 border rounded"></div>
            Booked
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border rounded"></div>
            Blocked
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary border rounded"></div>
            Selected
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
