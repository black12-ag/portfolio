import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { format, differenceInDays } from 'date-fns';
import { CalendarIcon, Users, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/components/PropertyCard';
import { supabaseHelpers } from '@/lib/supabase';

interface BookingData {
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  totalGuests: number;
  totalNights: number;
  basePrice: number;
  taxes: number;
  serviceFee: number;
  totalPrice: number;
}

interface BookingFormProps {
  property: Property;
  onBookingComplete: (bookingData: BookingData) => void;
}

export default function BookingForm({ property, onBookingComplete }: BookingFormProps) {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { formatPrice, convertPrice } = useCurrency();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const totalNights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const basePrice = totalNights * property.price;
  const serviceFee = basePrice * 0.14; // 14% service fee
  const taxes = basePrice * 0.12; // 12% taxes
  const totalPrice = basePrice + serviceFee + taxes;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to make a booking.",
        variant: "destructive"
      });
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Select dates",
        description: "Please select check-in and check-out dates.",
        variant: "destructive"
      });
      return;
    }

    if (totalNights <= 0) {
      toast({
        title: "Invalid dates",
        description: "Check-out date must be after check-in date.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('User not found');
      }

      const bookingData: BookingData = {
        checkIn,
        checkOut,
        adults,
        children,
        totalGuests: adults + children,
        totalNights,
        basePrice,
        taxes,
        serviceFee,
        totalPrice,
      };

      // Save booking to Supabase
      const savedBooking = await supabaseHelpers.createBooking({
        userId: user.id,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.images?.[0] || '',
        checkIn: checkIn?.toISOString(),
        checkOut: checkOut?.toISOString(),
        adults,
        children,
        totalGuests: adults + children,
        totalNights,
        basePrice,
        taxes,
        serviceFee,
        totalPrice,
        status: 'pending'
      });

      // Create notification for successful booking
      await supabaseHelpers.createNotification({
        userId: user.id,
        title: 'Booking Created',
        message: `Your booking for ${property.title} has been created successfully.`,
        type: 'booking'
      });

      toast({
        title: "Booking created",
        description: `Your reservation for ${property.title} has been created successfully.`,
        variant: "default"
      });

      onBookingComplete(bookingData);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-sm font-medium">Check-in</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "MMM dd") : "Add date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(date) => date < new Date() || (checkOut && date >= checkOut)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="text-sm font-medium">Check-out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "MMM dd") : "Add date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => date < new Date() || (checkIn && date <= checkIn)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Guest Selection */}
      <div>
        <Label className="text-sm font-medium">Guests</Label>
        <Popover open={showGuestPicker} onOpenChange={setShowGuestPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <Users className="mr-2 h-4 w-4" />
              {adults + children} {adults + children === 1 ? 'guest' : 'guests'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Adults</div>
                  <div className="text-sm text-muted-foreground">Ages 13 or above</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{adults}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setAdults(Math.min(10, adults + 1))}
                    disabled={adults >= 10}
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
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{children}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setChildren(Math.min(8, children + 1))}
                    disabled={children >= 8}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Price Breakdown */}
      {totalNights > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatPrice(property.price)} × {totalNights} nights</span>
              <span>{formatPrice(basePrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service fee</span>
              <span>{formatPrice(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxes</span>
              <span>{formatPrice(taxes)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Button */}
      <Button
        onClick={handleBooking}
        disabled={!checkIn || !checkOut || totalNights <= 0 || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Reserve${totalNights > 0 ? ` - ${formatPrice(totalPrice)}` : ''}`
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        You won't be charged yet
      </p>
    </div>
  );
}
