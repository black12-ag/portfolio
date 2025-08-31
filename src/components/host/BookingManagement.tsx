import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare,
  Check,
  X,
  Clock,
  Star,
  DollarSign
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAvatar?: string;
  propertyName: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  bookingDate: string;
  specialRequests?: string;
  nights: number;
}

export default function BookingManagement() {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const handleBookingAction = (bookingId: string, action: 'confirm' | 'cancel') => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: action === 'confirm' ? 'confirmed' : 'cancelled' }
        : booking
    ));

    toast({
      title: action === 'confirm' ? 'Booking confirmed' : 'Booking cancelled',
      description: `The booking has been ${action === 'confirm' ? 'confirmed' : 'cancelled'}.`,
    });
  };

  const sendMessage = () => {
    if (!replyMessage.trim()) return;

    // Simulate sending message
    toast({
      title: "Message sent",
      description: "Your message has been sent to the guest.",
    });

    setReplyMessage('');
    setSelectedBooking(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpcomingBookings = () => {
    return bookings.filter(booking => 
      booking.status === 'confirmed' && new Date(booking.checkIn) > new Date()
    );
  };

  const getPendingBookings = () => {
    return bookings.filter(booking => booking.status === 'pending');
  };

  const getRecentBookings = () => {
    return bookings.filter(booking => 
      booking.status === 'completed' || booking.status === 'cancelled'
    ).slice(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <p className="text-muted-foreground">Manage your property reservations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{getPendingBookings().length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{getUpcomingBookings().length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatPrice(bookings.reduce((sum, booking) => sum + booking.totalAmount, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({getPendingBookings().length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({getUpcomingBookings().length})
          </TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Pending Bookings */}
        <TabsContent value="pending">
          <div className="space-y-4">
            {getPendingBookings().map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={booking.guestAvatar} />
                        <AvatarFallback>{booking.guestName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold">{booking.guestName}</h3>
                          <p className="text-sm text-muted-foreground">{booking.propertyName}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {booking.guests} guests
                          </div>
                        </div>
                        {booking.specialRequests && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Special request:</strong> {booking.specialRequests}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <p className="font-semibold">{formatPrice(booking.totalAmount)}</p>
                      <p className="text-sm text-muted-foreground">{booking.nights} nights</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookingAction(booking.id, 'cancel')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBookingAction(booking.id, 'confirm')}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {getPendingBookings().length === 0 && (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending bookings</h3>
                <p className="text-muted-foreground">All booking requests have been processed.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Upcoming Bookings */}
        <TabsContent value="upcoming">
          <div className="space-y-4">
            {getUpcomingBookings().map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={booking.guestAvatar} />
                        <AvatarFallback>{booking.guestName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold">{booking.guestName}</h3>
                          <p className="text-sm text-muted-foreground">{booking.propertyName}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            {booking.guests} guests
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="h-4 w-4 mr-1" />
                            {booking.guestEmail}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <p className="font-semibold">{formatPrice(booking.totalAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end mt-4 pt-4 border-t space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Guest
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {getUpcomingBookings().length === 0 && (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming bookings</h3>
                <p className="text-muted-foreground">You don't have any confirmed bookings coming up.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* All Bookings */}
        <TabsContent value="all">
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={booking.guestAvatar} />
                        <AvatarFallback>{booking.guestName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{booking.guestName}</h4>
                        <p className="text-sm text-muted-foreground">{booking.propertyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <div className="font-medium">{formatPrice(booking.totalAmount)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <div className="space-y-4">
            {getRecentBookings().map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={booking.guestAvatar} />
                        <AvatarFallback>{booking.guestName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{booking.guestName}</h4>
                        <p className="text-sm text-muted-foreground">{booking.propertyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <div className="font-medium">{formatPrice(booking.totalAmount)}</div>
                      {booking.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Message Dialog */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Message {selectedBooking.guestName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Booking Details</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.propertyName} • {format(new Date(selectedBooking.checkIn), 'MMM dd')} - {format(new Date(selectedBooking.checkOut), 'MMM dd')}
                </p>
              </div>
              
              <div>
                <Label htmlFor="message">Your message</Label>
                <Textarea
                  id="message"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                  Cancel
                </Button>
                <Button onClick={sendMessage} disabled={!replyMessage.trim()}>
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
