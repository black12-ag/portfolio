import { supabaseHelpers } from '@/lib/supabase';

export interface DiscountCode {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_one_get_one';
  value: number; // percentage (0-100) or fixed amount
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  userLimit?: number; // max uses per user
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableCategories?: string[];
  excludedCategories?: string[];
  applicableUsers?: string[];
  firstTimeUsersOnly: boolean;
  stackable: boolean;
  autoApply: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DiscountValidation {
  isValid: boolean;
  error?: string;
  discount?: DiscountCode;
  discountAmount: number;
  finalAmount: number;
  message?: string;
}

export interface AppliedDiscount {
  code: string;
  discountAmount: number;
  type: DiscountCode['type'];
  description: string;
}

class DiscountService {
  private discounts: Map<string, DiscountCode> = new Map();
  private userUsage: Map<string, Map<string, number>> = new Map(); // userId -> codeId -> count

  constructor() {
    this.loadDiscounts();
    this.loadUserUsage();
  }

  // Load discount codes from storage
  private loadDiscounts(): void {
    const stored = localStorage.getItem('discount-codes');
    if (stored) {
      try {
        const codes = JSON.parse(stored);
        codes.forEach((code: DiscountCode) => {
          this.discounts.set(code.id, {
            ...code,
            validFrom: new Date(code.validFrom),
            validTo: new Date(code.validTo),
            createdAt: new Date(code.createdAt),
            updatedAt: new Date(code.updatedAt),
          });
        });
      } catch (error) {
        console.error('Failed to load discount codes:', error);
      }
    }

    // Add default discount codes if none exist
    if (this.discounts.size === 0) {
      this.createDefaultDiscounts();
    }
  }

  private loadUserUsage(): void {
    const stored = localStorage.getItem('discount-user-usage');
    if (stored) {
      try {
        const usage = JSON.parse(stored);
        Object.entries(usage).forEach(([userId, userUsage]) => {
          this.userUsage.set(userId, new Map(Object.entries(userUsage as Record<string, number>)));
        });
      } catch (error) {
        console.error('Failed to load user usage:', error);
      }
    }
  }

  private saveDiscounts(): void {
    const codes = Array.from(this.discounts.values());
    localStorage.setItem('discount-codes', JSON.stringify(codes));
  }

  private saveUserUsage(): void {
    const usage: Record<string, Record<string, number>> = {};
    this.userUsage.forEach((userUsage, userId) => {
      usage[userId] = Object.fromEntries(userUsage);
    });
    localStorage.setItem('discount-user-usage', JSON.stringify(usage));
  }

  private createDefaultDiscounts(): void {
    const defaultDiscounts: Omit<DiscountCode, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        code: 'WELCOME10',
        name: 'Welcome Discount',
        description: '10% off for new users',
        type: 'percentage',
        value: 10,
        minimumAmount: 50,
        maximumDiscount: 100,
        usageLimit: 1000,
        usedCount: 0,
        userLimit: 1,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        firstTimeUsersOnly: true,
        stackable: false,
        autoApply: false,
        createdBy: 'system',
      },
      {
        code: 'SAVE20',
        name: 'Save 20%',
        description: '20% off on bookings over $200',
        type: 'percentage',
        value: 20,
        minimumAmount: 200,
        maximumDiscount: 200,
        usageLimit: 500,
        usedCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
        firstTimeUsersOnly: false,
        stackable: false,
        autoApply: false,
        createdBy: 'system',
      },
      {
        code: 'EARLYBIRD',
        name: 'Early Bird Special',
        description: '$50 off for bookings made 30+ days in advance',
        type: 'fixed',
        value: 50,
        minimumAmount: 150,
        usageLimit: 200,
        usedCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
        firstTimeUsersOnly: false,
        stackable: true,
        autoApply: true,
        metadata: { advanceDays: 30 },
        createdBy: 'system',
      },
      {
        code: 'LOYALTY25',
        name: 'Loyalty Reward',
        description: '25% off for returning customers',
        type: 'percentage',
        value: 25,
        minimumAmount: 100,
        maximumDiscount: 150,
        usageLimit: 300,
        usedCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
        isActive: true,
        firstTimeUsersOnly: false,
        stackable: false,
        autoApply: false,
        createdBy: 'system',
      },
      {
        code: 'WEEKEND15',
        name: 'Weekend Special',
        description: '15% off weekend stays',
        type: 'percentage',
        value: 15,
        minimumAmount: 80,
        maximumDiscount: 120,
        usageLimit: 400,
        usedCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        isActive: true,
        firstTimeUsersOnly: false,
        stackable: true,
        autoApply: false,
        metadata: { weekendOnly: true },
        createdBy: 'system',
      },
    ];

    defaultDiscounts.forEach((discount) => {
      const id = `discount_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullDiscount: DiscountCode = {
        ...discount,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.discounts.set(id, fullDiscount);
    });

    this.saveDiscounts();
  }

  // Validate and apply discount code
  async validateDiscount(
    code: string,
    amount: number,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<DiscountValidation> {
    const discount = Array.from(this.discounts.values()).find(
      d => d.code.toLowerCase() === code.toLowerCase() && d.isActive
    );

    if (!discount) {
      return {
        isValid: false,
        error: 'Invalid discount code',
        discountAmount: 0,
        finalAmount: amount,
      };
    }

    // Check if discount is still valid (date range)
    const now = new Date();
    if (now < discount.validFrom || now > discount.validTo) {
      return {
        isValid: false,
        error: 'This discount code has expired',
        discountAmount: 0,
        finalAmount: amount,
      };
    }

    // Check usage limits
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return {
        isValid: false,
        error: 'This discount code has reached its usage limit',
        discountAmount: 0,
        finalAmount: amount,
      };
    }

    // Check user-specific limits
    const userUsageCount = this.getUserUsageCount(userId, discount.id);
    if (discount.userLimit && userUsageCount >= discount.userLimit) {
      return {
        isValid: false,
        error: 'You have already used this discount code the maximum number of times',
        discountAmount: 0,
        finalAmount: amount,
      };
    }

    // Check first-time user restriction
    if (discount.firstTimeUsersOnly && userUsageCount > 0) {
      return {
        isValid: false,
        error: 'This discount is only available for first-time users',
        discountAmount: 0,
        finalAmount: amount,
      };
    }

    // Check minimum amount
    if (discount.minimumAmount && amount < discount.minimumAmount) {
      return {
        isValid: false,
        error: `Minimum order amount of ${discount.minimumAmount} required`,
        discountAmount: 0,
        finalAmount: amount,
      };
    }

    // Check metadata conditions (e.g., weekend only, advance booking)
    if (discount.metadata) {
      const validationError = this.validateMetadataConditions(discount, metadata);
      if (validationError) {
        return {
          isValid: false,
          error: validationError,
          discountAmount: 0,
          finalAmount: amount,
        };
      }
    }

    // Calculate discount amount
    const discountAmount = this.calculateDiscountAmount(discount, amount);
    const finalAmount = Math.max(0, amount - discountAmount);

    return {
      isValid: true,
      discount,
      discountAmount,
      finalAmount,
      message: `${discount.description} - You saved ${discountAmount}!`,
    };
  }

  private validateMetadataConditions(discount: DiscountCode, metadata?: Record<string, any>): string | null {
    if (!discount.metadata || !metadata) return null;

    // Weekend only check
    if (discount.metadata.weekendOnly) {
      const checkInDate = metadata.checkInDate ? new Date(metadata.checkInDate) : new Date();
      const dayOfWeek = checkInDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
        return 'This discount is only valid for weekend stays (Friday-Sunday)';
      }
    }

    // Advance booking check
    if (discount.metadata.advanceDays) {
      const checkInDate = metadata.checkInDate ? new Date(metadata.checkInDate) : new Date();
      const now = new Date();
      const daysDifference = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference < discount.metadata.advanceDays) {
        return `This discount requires booking at least ${discount.metadata.advanceDays} days in advance`;
      }
    }

    return null;
  }

  private calculateDiscountAmount(discount: DiscountCode, amount: number): number {
    let discountAmount = 0;

    switch (discount.type) {
      case 'percentage':
        discountAmount = (amount * discount.value) / 100;
        if (discount.maximumDiscount) {
          discountAmount = Math.min(discountAmount, discount.maximumDiscount);
        }
        break;
      case 'fixed':
        discountAmount = Math.min(discount.value, amount);
        break;
      case 'free_shipping':
        // Assuming shipping cost is passed in metadata
        discountAmount = 0; // Would be calculated based on shipping cost
        break;
      case 'buy_one_get_one':
        // This would require more complex logic based on items
        discountAmount = 0;
        break;
    }

    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
  }

  private getUserUsageCount(userId: string, discountId: string): number {
    const userUsage = this.userUsage.get(userId);
    return userUsage?.get(discountId) || 0;
  }

  // Apply discount (record usage)
  async applyDiscount(discountId: string, userId: string): Promise<void> {
    const discount = this.discounts.get(discountId);
    if (!discount) {
      throw new Error('Discount not found');
    }

    // Update usage count
    discount.usedCount += 1;
    discount.updatedAt = new Date();
    this.discounts.set(discountId, discount);

    // Update user usage
    if (!this.userUsage.has(userId)) {
      this.userUsage.set(userId, new Map());
    }
    const userUsage = this.userUsage.get(userId);
    const currentUsage = userUsage.get(discountId) || 0;
    userUsage.set(discountId, currentUsage + 1);

    // Save to storage
    this.saveDiscounts();
    this.saveUserUsage();

    // Save to Supabase if available
    try {
      await supabaseHelpers.recordDiscountUsage(discountId, userId);
    } catch (error) {
      console.error('Failed to record discount usage in Supabase:', error);
    }
  }

  // Get auto-applicable discounts
  async getAutoApplicableDiscounts(
    amount: number,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<DiscountCode[]> {
    const applicableDiscounts: DiscountCode[] = [];

    for (const discount of this.discounts.values()) {
      if (!discount.autoApply || !discount.isActive) continue;

      const validation = await this.validateDiscount(discount.code, amount, userId, metadata);
      if (validation.isValid) {
        applicableDiscounts.push(discount);
      }
    }

    // Sort by discount amount (highest first)
    return applicableDiscounts.sort((a, b) => {
      const aAmount = this.calculateDiscountAmount(a, amount);
      const bAmount = this.calculateDiscountAmount(b, amount);
      return bAmount - aAmount;
    });
  }

  // Get all active discount codes (for display)
  getActiveDiscounts(): DiscountCode[] {
    const now = new Date();
    return Array.from(this.discounts.values())
      .filter(d => d.isActive && now >= d.validFrom && now <= d.validTo)
      .sort((a, b) => b.value - a.value);
  }

  // Admin functions
  async createDiscount(discount: Omit<DiscountCode, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<DiscountCode> {
    const id = `discount_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDiscount: DiscountCode = {
      ...discount,
      id,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.discounts.set(id, newDiscount);
    this.saveDiscounts();

    return newDiscount;
  }

  async updateDiscount(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode> {
    const discount = this.discounts.get(id);
    if (!discount) {
      throw new Error('Discount not found');
    }

    const updatedDiscount = {
      ...discount,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    this.discounts.set(id, updatedDiscount);
    this.saveDiscounts();

    return updatedDiscount;
  }

  async deleteDiscount(id: string): Promise<void> {
    this.discounts.delete(id);
    this.saveDiscounts();
  }

  // Get usage statistics
  getDiscountStats(id: string): { totalUses: number; uniqueUsers: number; totalSavings: number } {
    const discount = this.discounts.get(id);
    if (!discount) {
      throw new Error('Discount not found');
    }

    let uniqueUsers = 0;
    let totalSavings = 0;

    this.userUsage.forEach((userUsage) => {
      const uses = userUsage.get(id) || 0;
      if (uses > 0) {
        uniqueUsers++;
        // This is a simplified calculation - in a real app, you'd track actual savings
        totalSavings += uses * (discount.type === 'percentage' ? discount.value : discount.value);
      }
    });

    return {
      totalUses: discount.usedCount,
      uniqueUsers,
      totalSavings,
    };
  }

  // Get user's available discounts
  async getUserAvailableDiscounts(userId: string): Promise<DiscountCode[]> {
    const availableDiscounts: DiscountCode[] = [];
    const now = new Date();

    for (const discount of this.discounts.values()) {
      if (!discount.isActive || now < discount.validFrom || now > discount.validTo) {
        continue;
      }

      const userUsageCount = this.getUserUsageCount(userId, discount.id);
      
      // Check if user can still use this discount
      const canUse = !discount.userLimit || userUsageCount < discount.userLimit;
      const hasUsageLeft = !discount.usageLimit || discount.usedCount < discount.usageLimit;
      
      if (canUse && hasUsageLeft) {
        availableDiscounts.push(discount);
      }
    }

    return availableDiscounts.sort((a, b) => b.value - a.value);
  }
}

export const discountService = new DiscountService();
