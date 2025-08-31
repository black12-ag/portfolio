import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseHelpers } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import DateRangePicker, { type DateRange } from '@/components/ui/DateRangePicker';
import GuestsPicker from '@/components/ui/GuestsPicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import robustLiteApiService from '@/services/robustLiteApiService';
import currencyService from '@/services/currencyService';
import LiteAPIErrorBoundary from '@/components/liteapi/LiteAPIErrorBoundary';

interface BookingWidgetProps {
  propertyId: string;
  propertyName: string;
  pricePerNight: number;
  maxGuests?: number;
  instantBook?: boolean;
  onBookingComplete?: (bookingId: string) => void;
}

interface BookingDetails {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  nights: number;
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
}

export default function BookingWidget({ 
  propertyId, 
  propertyName, 
  pricePerNight, 
  maxGuests = 8,
  instantBook = false,
  onBookingComplete 
}: BookingWidgetProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [dates, setDates] = useState<DateRange>({ from: null, to: null });
  const [guests, setGuests] = useState(2);
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Calculate booking details
  useEffect(() => {
    if (dates.from && dates.to) {
      const nights = Math.ceil((dates.to.getTime() - dates.from.getTime()) / (1000 * 60 * 60 * 24));
      const subtotal = nights * pricePerNight;
      const taxes = Math.round(subtotal * 0.12); // 12% tax
      const fees = Math.round(subtotal * 0.05); // 5% service fee
      const total = subtotal + taxes + fees;

      setBookingDetails({
        checkIn: dates.from,
        checkOut: dates.to,
        guests,
        nights,
        subtotal,
        taxes,
        fees,
        total
      });
    } else {
      setBookingDetails(null);
    }
  }, [dates.from, dates.to, guests, pricePerNight]);

  const handleBookNow = async () => {
    if (!dates.from || !dates.to) {
      toast({
        title: t('booking.selectDates'),
        description: t('booking.selectDatesDescription'),
        variant: "destructive"
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a booking.",
        variant: "destructive"
      });
      return;
    }

    // Save booking data for checkout
    const pendingBooking = {
      propertyId,
      propertyName,
    propertyImage: '',
      roomType: 'Deluxe Room',
      checkIn: dates.from.toISOString(),
      checkOut: dates.to.toISOString(),
      guests,
      nights: bookingDetails?.nights || 1,
      pricePerNight,
      subtotal: bookingDetails?.subtotal || 0,
      taxes: bookingDetails?.taxes || 0,
      fees: bookingDetails?.fees || 0,
      total: bookingDetails?.total || 0
    };
    
    // Save to Supabase instead of localStorage
      if (user) {
        try {
          await supabaseHelpers.createBooking({
            ...pendingBooking,
            userId: user.id,
            status: 'pending'
          });
        } catch (error) {
          console.error('Failed to save booking:', error);
        }
      }
    
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  const handleConfirmBooking = async () => {
    if (!bookingDetails) return;

    setIsBooking(true);
    try {
      // Check if this is a LiteAPI hotel
      const liteApiProperties = JSON.parse(localStorage.getItem('liteapi_properties') || '[]');
      const isLiteApiHotel = liteApiProperties.find((p: { id: string }) => p.id === propertyId);
      
      let bookingResult;
      
      if (isLiteApiHotel) {
        console.log(`🏨 Creating LiteAPI booking for hotel: ${propertyName}`);
        
        // Use robust LiteAPI booking service
        bookingResult = await robustLiteApiService.createBooking({
          hotelId: isLiteApiHotel.liteApiId || propertyId,
          roomType: 'standard', // This would come from room selection
          checkinDate: bookingDetails.checkIn?.toISOString().split('T')[0] || '',
          checkoutDate: bookingDetails.checkOut?.toISOString().split('T')[0] || '',
          adults: bookingDetails.guests,
          children: 0,
          currency: currencyService.getDefaultCurrency(),
          guestInfo: {
            firstName: user?.firstName || 'Guest',
            lastName: user?.lastName || 'User',
            email: user?.email || 'guest@example.com',
            phone: user?.phone || '+251911000000'
          }
        });
        
        console.log('✅ LiteAPI booking response:', bookingResult);
        
        if (!bookingResult.success) {
          throw new Error(bookingResult.error || 'Booking failed');
        }
      } else {
        // For non-LiteAPI properties, use existing booking system
        console.log(`🏠 Creating regular booking for property: ${propertyName}`);
        bookingResult = {
          success: true,
          bookingId: `MTH-${Date.now().toString().slice(-6)}`,
          confirmationCode: `CONF-${Date.now().toString().slice(-6)}`
        };
      }
      
      const bookingId = bookingResult.bookingId;
      
      // Save booking to localStorage
      // Get bookings from Supabase
      const existingBookings = user ? await supabaseHelpers.getUserBookings(user.id) : [];
      const newBooking = {
        id: bookingId,
        propertyId,
        propertyName,
    propertyImage: isLiteApiHotel?.images?.[0] || '',
        location: isLiteApiHotel?.location || 'Addis Ababa, Ethiopia',
        checkIn: bookingDetails.checkIn?.toISOString().split('T')[0],
        checkOut: bookingDetails.checkOut?.toISOString().split('T')[0],
        guests: bookingDetails.guests,
        totalPrice: bookingDetails.total,
        status: 'confirmed',
        bookingReference: bookingResult.confirmationCode || bookingId,
        isLiteApiBooking: !!isLiteApiHotel,
        liteApiData: isLiteApiHotel ? bookingResult : null,
        createdAt: new Date().toISOString()
      };
      
      existingBookings.push(newBooking);
      localStorage.setItem('user-bookings', JSON.stringify(existingBookings));

      setBookingStep('confirmation');
      
      toast({
        title: "Booking confirmed! 🎉",
        description: `Your booking ${bookingId} has been confirmed${isLiteApiHotel ? ' through LiteAPI' : ''}.`,
      });

      if (onBookingComplete) {
        onBookingComplete(bookingId);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const renderBookingModal = () => {
    if (!bookingDetails) return null;

    return (
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bookingStep === 'details' && 'Booking Details'}
              {bookingStep === 'payment' && 'Payment Information'}
              {bookingStep === 'confirmation' && 'Booking Confirmed!'}
            </DialogTitle>
          </DialogHeader>

          {bookingStep === 'details' && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">{propertyName}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Check-in</span>
                    <p className="font-medium">{bookingDetails.checkIn?.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check-out</span>
                    <p className="font-medium">{bookingDetails.checkOut?.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('booking.guests')}</span>
                    <p className="font-medium">{bookingDetails.guests} {t('booking.guests')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nights</span>
                    <p className="font-medium">{bookingDetails.nights} nights</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{formatPrice(pricePerNight)} x {bookingDetails.nights} nights</span>
                  <span>{formatPrice(bookingDetails.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Service fee</span>
                  <span>{formatPrice(bookingDetails.fees)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxes</span>
                  <span>{formatPrice(bookingDetails.taxes)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(bookingDetails.total)}</span>
                </div>
              </div>

              <Button 
                onClick={() => setBookingStep('payment')} 
                className="w-full"
                size="lg"
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {bookingStep === 'payment' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456" 
                    defaultValue="4242 4242 4242 4242"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="MM/YY" defaultValue="12/28" disabled />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" defaultValue="123" disabled />
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-3">
                <div className="flex justify-between font-semibold">
                  <span>Total to pay</span>
                  <span>{formatPrice(bookingDetails.total)}</span>
                </div>
              </div>

              <Button 
                onClick={handleConfirmBooking} 
                className="w-full"
                size="lg"
                disabled={isBooking}
              >
                {isBooking ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Complete Booking
                  </>
                )}
              </Button>
            </div>
          )}

          {bookingStep === 'confirmation' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Booking Confirmed!</h3>
                <p className="text-muted-foreground">
                  You'll receive a confirmation email shortly.
                </p>
              </div>
              
              <div className="bg-muted rounded-lg p-4 text-left">
                <h4 className="font-medium mb-2">Booking Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Property:</span> {propertyName}</p>
                  <p><span className="text-muted-foreground">Dates:</span> {bookingDetails.checkIn?.toLocaleDateString()} - {bookingDetails.checkOut?.toLocaleDateString()}</p>
                  <p><span className="text-muted-foreground">{t('booking.guests')}:</span> {bookingDetails.guests}</p>
                  <p><span className="text-muted-foreground">Total:</span> {formatPrice(bookingDetails.total)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowBookingModal(false)}>
                  Close
                </Button>
                <Button onClick={() => window.location.href = '/bookings'}>
                  View My Bookings
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <LiteAPIErrorBoundary>
      <Card className="sticky top-24 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {formatPrice(pricePerNight)}
              <span className="text-base font-normal text-muted-foreground"> / night</span>
            </span>
            {instantBook && (
              <Badge className="bg-green-100 text-green-800">Instant Book</Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Date Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">{t('booking.selectDates')}</Label>
            <DateRangePicker
              value={dates}
              onChange={setDates}
              placeholder={t('booking.addDates')}
              className="w-full"
            />
          </div>

          {/* Guest Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">{t('booking.guests')}</Label>
            <GuestsPicker
              value={guests}
              onChange={setGuests}
              maxGuests={maxGuests}
              className="w-full"
            />
          </div>

          {/* Price Breakdown */}
          {bookingDetails && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>{formatPrice(pricePerNight)} x {bookingDetails.nights} nights</span>
                <span>{formatPrice(bookingDetails.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Service fee</span>
                <span>{formatPrice(bookingDetails.fees)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxes</span>
                <span>{formatPrice(bookingDetails.taxes)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(bookingDetails.total)}</span>
              </div>
            </div>
          )}

          {/* Booking Button */}
          <Button 
            onClick={handleBookNow}
            className="w-full" 
            size="lg"
            disabled={!dates.from || !dates.to}
          >
            {instantBook ? t('booking.bookInstantly') : t('booking.reserveNow')}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t('booking.noChargeYet')}
          </p>
        </CardContent>
      </Card>

      {renderBookingModal()}
    </LiteAPIErrorBoundary>
  );
}
