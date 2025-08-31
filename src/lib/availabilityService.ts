// Real-time Availability Service
// Handles property availability, calendar conflicts, and booking validation

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BookingConflict {
  id: string;
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  guestName: string;
}

export interface AvailabilityRule {
  id: string;
  propertyId: string;
  type: 'blocked' | 'price_override' | 'minimum_stay' | 'maximum_stay';
  startDate: Date;
  endDate: Date;
  value?: number; // For price overrides or stay requirements
  reason?: string;
}

export interface PropertyAvailability {
  propertyId: string;
  available: boolean;
  conflicts: BookingConflict[];
  rules: AvailabilityRule[];
  pricing: {
    basePrice: number;
    dynamicPrice: number;
    currency: string;
    factors: PricingFactor[];
  };
  inventory: {
    total: number;
    available: number;
    reserved: number;
  };
}

export interface PricingFactor {
  type: 'seasonal' | 'demand' | 'day_of_week' | 'minimum_stay' | 'last_minute' | 'early_bird';
  multiplier: number;
  reason: string;
}

export interface AvailabilityRequest {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms?: number;
}

export interface AvailabilityResponse {
  available: boolean;
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  pricing: {
    basePrice: number;
    totalPrice: number;
    breakdown: {
      accommodation: number;
      fees: number;
      taxes: number;
      discounts: number;
    };
    currency: string;
  };
  inventory: {
    available: number;
    requested: number;
  };
  restrictions: string[];
  alternatives?: AlternativeDate[];
}

export interface AlternativeDate {
  checkIn: Date;
  checkOut: Date;
  price: number;
  available: boolean;
}

class AvailabilityService {
  private bookings: Map<string, BookingConflict[]> = new Map();
  private rules: Map<string, AvailabilityRule[]> = new Map();
  private listeners: Map<string, ((availability: PropertyAvailability) => void)[]> = new Map();

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    // Load bookings from localStorage
    const savedBookings = localStorage.getItem('property_bookings');
    if (savedBookings) {
      const bookingsData = JSON.parse(savedBookings);
      for (const [propertyId, bookings] of Object.entries(bookingsData)) {
        this.bookings.set(propertyId, (bookings as any[]).map(booking => ({
          ...booking,
          checkIn: new Date(booking.checkIn),
          checkOut: new Date(booking.checkOut)
        })));
      }
    }

    // Load availability rules
    const savedRules = localStorage.getItem('availability_rules');
    if (savedRules) {
      const rulesData = JSON.parse(savedRules);
      for (const [propertyId, rules] of Object.entries(rulesData)) {
        this.rules.set(propertyId, (rules as any[]).map(rule => ({
          ...rule,
          startDate: new Date(rule.startDate),
          endDate: new Date(rule.endDate)
        })));
      }
    }
  }

  private saveData(): void {
    // Save bookings
    const bookingsData: Record<string, unknown> = {};
    for (const [propertyId, bookings] of this.bookings.entries()) {
      bookingsData[propertyId] = bookings;
    }
    localStorage.setItem('property_bookings', JSON.stringify(bookingsData));

    // Save rules
    const rulesData: Record<string, unknown> = {};
    for (const [propertyId, rules] of this.rules.entries()) {
      rulesData[propertyId] = rules;
    }
    localStorage.setItem('availability_rules', JSON.stringify(rulesData));
  }

  async checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    const { propertyId, checkIn, checkOut, guests, rooms = 1 } = request;
    
    // Calculate nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Get existing bookings for this property
    const existingBookings = this.bookings.get(propertyId) || [];
    
    // Check for conflicts
    const conflicts = this.findConflicts(existingBookings, checkIn, checkOut);
    const hasConflicts = conflicts.length > 0;

    // Get availability rules
    const rules = this.rules.get(propertyId) || [];
    const applicableRules = this.getApplicableRules(rules, checkIn, checkOut);

    // Check if dates are blocked
    const blockedRules = applicableRules.filter(rule => rule.type === 'blocked');
    const isBlocked = blockedRules.length > 0;

    // Check minimum/maximum stay requirements
    const minStayRules = applicableRules.filter(rule => rule.type === 'minimum_stay');
    const maxStayRules = applicableRules.filter(rule => rule.type === 'maximum_stay');
    
    const restrictions: string[] = [];
    
    for (const rule of minStayRules) {
      if (nights < (rule.value || 1)) {
        restrictions.push(`Minimum stay of ${rule.value} nights required`);
      }
    }
    
    for (const rule of maxStayRules) {
      if (nights > (rule.value || 365)) {
        restrictions.push(`Maximum stay of ${rule.value} nights allowed`);
      }
    }

    // Calculate pricing
    const pricing = this.calculateDynamicPricing(propertyId, checkIn, checkOut, guests, nights);

    // Check inventory
    const inventory = this.checkInventory(propertyId, rooms);

    // Determine availability
    const available = !hasConflicts && !isBlocked && restrictions.length === 0 && inventory.available >= rooms;

    // Generate alternatives if not available
    const alternatives = available ? undefined : this.generateAlternatives(propertyId, checkIn, checkOut, guests);

    return {
      available,
      propertyId,
      checkIn,
      checkOut,
      nights,
      pricing,
      inventory: {
        available: inventory.available,
        requested: rooms
      },
      restrictions,
      alternatives
    };
  }

  private findConflicts(bookings: BookingConflict[], checkIn: Date, checkOut: Date): BookingConflict[] {
    return bookings.filter(booking => {
      if (booking.status === 'cancelled') return false;
      
      // Check if dates overlap
      return (
        (checkIn >= booking.checkIn && checkIn < booking.checkOut) ||
        (checkOut > booking.checkIn && checkOut <= booking.checkOut) ||
        (checkIn <= booking.checkIn && checkOut >= booking.checkOut)
      );
    });
  }

  private getApplicableRules(rules: AvailabilityRule[], checkIn: Date, checkOut: Date): AvailabilityRule[] {
    return rules.filter(rule => {
      return (
        (checkIn >= rule.startDate && checkIn <= rule.endDate) ||
        (checkOut >= rule.startDate && checkOut <= rule.endDate) ||
        (checkIn <= rule.startDate && checkOut >= rule.endDate)
      );
    });
  }

  private calculateDynamicPricing(
    propertyId: string, 
    checkIn: Date, 
    checkOut: Date, 
    guests: number, 
    nights: number
  ): AvailabilityResponse['pricing'] {
    const basePrice = 100; // Default base price per night
    const factors: PricingFactor[] = [];
    let totalMultiplier = 1;

    // Seasonal pricing
    const month = checkIn.getMonth();
    if (month >= 11 || month <= 1) { // Dec, Jan, Feb - peak season
      factors.push({ type: 'seasonal', multiplier: 1.3, reason: 'Peak season' });
      totalMultiplier *= 1.3;
    } else if (month >= 5 && month <= 8) { // Jun, Jul, Aug, Sep - high season
      factors.push({ type: 'seasonal', multiplier: 1.15, reason: 'High season' });
      totalMultiplier *= 1.15;
    }

    // Day of week pricing
    const isWeekend = checkIn.getDay() === 5 || checkIn.getDay() === 6; // Friday or Saturday
    if (isWeekend) {
      factors.push({ type: 'day_of_week', multiplier: 1.2, reason: 'Weekend rate' });
      totalMultiplier *= 1.2;
    }

    // Last minute pricing
    const daysAhead = Math.ceil((checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysAhead <= 3) {
      factors.push({ type: 'last_minute', multiplier: 0.9, reason: 'Last minute discount' });
      totalMultiplier *= 0.9;
    }

    // Early bird pricing
    if (daysAhead >= 30) {
      factors.push({ type: 'early_bird', multiplier: 0.85, reason: 'Early booking discount' });
      totalMultiplier *= 0.85;
    }

    // Minimum stay discount
    if (nights >= 7) {
      factors.push({ type: 'minimum_stay', multiplier: 0.9, reason: 'Weekly stay discount' });
      totalMultiplier *= 0.9;
    }

    const dynamicPrice = Math.round(basePrice * totalMultiplier);
    const accommodation = dynamicPrice * nights;
    const fees = Math.round(accommodation * 0.12); // 12% service fee
    const taxes = Math.round(accommodation * 0.08); // 8% tax
    const discounts = 0;

    return {
      basePrice: dynamicPrice,
      totalPrice: accommodation + fees + taxes - discounts,
      breakdown: {
        accommodation,
        fees,
        taxes,
        discounts
      },
      currency: 'ETB'
    };
  }

  private checkInventory(propertyId: string, requestedRooms: number): { total: number; available: number; reserved: number } {
    // For now, assume each property has 1 unit available
    // In a real system, this would query the actual inventory
    return {
      total: 1,
      available: 1,
      reserved: 0
    };
  }

  private generateAlternatives(propertyId: string, checkIn: Date, checkOut: Date, guests: number): AlternativeDate[] {
    const alternatives: AlternativeDate[] = [];
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Generate 5 alternative date ranges
    for (let i = 1; i <= 5; i++) {
      const altCheckIn = new Date(checkIn);
      altCheckIn.setDate(altCheckIn.getDate() + (i * 7)); // Weekly intervals
      
      const altCheckOut = new Date(altCheckIn);
      altCheckOut.setDate(altCheckOut.getDate() + nights);

      const altRequest: AvailabilityRequest = {
        propertyId,
        checkIn: altCheckIn,
        checkOut: altCheckOut,
        guests
      };

      try {
        // Note: This would be async in a real implementation
        const available = true; // Simplified for now
        const pricing = this.calculateDynamicPricing(propertyId, altCheckIn, altCheckOut, guests, nights);
        
        alternatives.push({
          checkIn: altCheckIn,
          checkOut: altCheckOut,
          price: pricing.totalPrice,
          available
        });
      } catch (error) {
        // Skip this alternative if there's an error
      }
    }

    return alternatives;
  }

  async createBooking(
    propertyId: string,
    checkIn: Date,
    checkOut: Date,
    guestName: string,
    status: 'pending' | 'confirmed' = 'pending'
  ): Promise<BookingConflict> {
    // Check availability first
    const request: AvailabilityRequest = {
      propertyId,
      checkIn,
      checkOut,
      guests: 1 // Simplified
    };

    const availability = await this.checkAvailability(request);
    if (!availability.available) {
      throw new Error('Property is not available for the selected dates');
    }

    // Create booking
    const booking: BookingConflict = {
      id: Date.now().toString(),
      propertyId,
      checkIn,
      checkOut,
      status,
      guestName
    };

    // Add to bookings
    const existingBookings = this.bookings.get(propertyId) || [];
    existingBookings.push(booking);
    this.bookings.set(propertyId, existingBookings);

    this.saveData();
    this.notifyListeners(propertyId);

    return booking;
  }

  async cancelBooking(propertyId: string, bookingId: string): Promise<void> {
    const bookings = this.bookings.get(propertyId) || [];
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.status = 'cancelled';
    this.saveData();
    this.notifyListeners(propertyId);
  }

  async addAvailabilityRule(rule: Omit<AvailabilityRule, 'id'>): Promise<AvailabilityRule> {
    const newRule: AvailabilityRule = {
      ...rule,
      id: Date.now().toString()
    };

    const existingRules = this.rules.get(rule.propertyId) || [];
    existingRules.push(newRule);
    this.rules.set(rule.propertyId, existingRules);

    this.saveData();
    this.notifyListeners(rule.propertyId);

    return newRule;
  }

  async removeAvailabilityRule(propertyId: string, ruleId: string): Promise<void> {
    const rules = this.rules.get(propertyId) || [];
    const filteredRules = rules.filter(rule => rule.id !== ruleId);
    this.rules.set(propertyId, filteredRules);

    this.saveData();
    this.notifyListeners(propertyId);
  }

  getPropertyAvailability(propertyId: string): PropertyAvailability {
    const conflicts = this.bookings.get(propertyId) || [];
    const rules = this.rules.get(propertyId) || [];

    return {
      propertyId,
      available: true, // Simplified - would check current availability
      conflicts: conflicts.filter(c => c.status !== 'cancelled'),
      rules,
      pricing: {
        basePrice: 100,
        dynamicPrice: 100,
        currency: 'ETB',
        factors: []
      },
      inventory: {
        total: 1,
        available: 1,
        reserved: 0
      }
    };
  }

  subscribeToAvailability(propertyId: string, callback: (availability: PropertyAvailability) => void): () => void {
    const listeners = this.listeners.get(propertyId) || [];
    listeners.push(callback);
    this.listeners.set(propertyId, listeners);

    // Return unsubscribe function
    return () => {
      const currentListeners = this.listeners.get(propertyId) || [];
      const filteredListeners = currentListeners.filter(cb => cb !== callback);
      this.listeners.set(propertyId, filteredListeners);
    };
  }

  private notifyListeners(propertyId: string): void {
    const listeners = this.listeners.get(propertyId) || [];
    const availability = this.getPropertyAvailability(propertyId);
    
    listeners.forEach(callback => {
      try {
        callback(availability);
      } catch (error) {
        console.error('Error in availability listener:', error);
      }
    });
  }

  // Utility methods
  getBookingsByProperty(propertyId: string): BookingConflict[] {
    return this.bookings.get(propertyId) || [];
  }

  getRulesByProperty(propertyId: string): AvailabilityRule[] {
    return this.rules.get(propertyId) || [];
  }

  getBookingsByDateRange(propertyId: string, startDate: Date, endDate: Date): BookingConflict[] {
    const bookings = this.bookings.get(propertyId) || [];
    return bookings.filter(booking => {
      return booking.checkIn >= startDate && booking.checkOut <= endDate;
    });
  }

  async getAvailabilityCalendar(propertyId: string, year: number, month: number): Promise<Record<string, boolean>> {
    const calendar: Record<string, boolean> = {};
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateKey = date.toISOString().split('T')[0];
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      try {
        const availability = await this.checkAvailability({
          propertyId,
          checkIn: new Date(date),
          checkOut: nextDay,
          guests: 1
        });
        calendar[dateKey] = availability.available;
      } catch (error) {
        calendar[dateKey] = false;
      }
    }

    return calendar;
  }
}

// Export singleton instance
export const availabilityService = new AvailabilityService();

// Helper functions
export function isDateAvailable(bookings: BookingConflict[], date: Date): boolean {
  return !bookings.some(booking => {
    return booking.status !== 'cancelled' && date >= booking.checkIn && date < booking.checkOut;
  });
}

export function getDateRangePrice(basePrice: number, checkIn: Date, checkOut: Date): number {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  return basePrice * nights;
}

export function formatDateRange(checkIn: Date, checkOut: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric' 
  };
  
  return `${checkIn.toLocaleDateString('en-US', options)} - ${checkOut.toLocaleDateString('en-US', options)}`;
}

export function getMinimumStay(rules: AvailabilityRule[], date: Date): number {
  const applicableRules = rules.filter(rule => 
    rule.type === 'minimum_stay' && 
    date >= rule.startDate && 
    date <= rule.endDate
  );
  
  return Math.max(...applicableRules.map(rule => rule.value || 1), 1);
}

export function getMaximumStay(rules: AvailabilityRule[], date: Date): number {
  const applicableRules = rules.filter(rule => 
    rule.type === 'maximum_stay' && 
    date >= rule.startDate && 
    date <= rule.endDate
  );
  
  if (applicableRules.length === 0) return 365; // Default max stay
  return Math.min(...applicableRules.map(rule => rule.value || 365));
}
