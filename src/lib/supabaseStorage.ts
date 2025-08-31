/**
 * Supabase Storage Utilities
 * Replaces localStorage with Supabase database storage
 */

import { supabase, supabaseHelpers } from './supabase';

export class SupabaseStorage {
  private static userId: string | null = null;

  static setUserId(id: string) {
    this.userId = id;
  }

  // Replace localStorage.getItem
  static async getItem(key: string): Promise<string | null> {
    if (!this.userId) return null;

    try {
      const { data } = await supabase
        .from('user_storage')
        .select('value')
        .eq('user_id', this.userId)
        .eq('key', key)
        .single();

      return data?.value || null;
    } catch {
      return null;
    }
  }

  // Replace localStorage.setItem
  static async setItem(key: string, value: string): Promise<void> {
    if (!this.userId) return;

    try {
      await supabase
        .from('user_storage')
        .upsert({
          user_id: this.userId,
          key,
          value,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  }

  // Replace localStorage.removeItem
  static async removeItem(key: string): Promise<void> {
    if (!this.userId) return;

    try {
      await supabase
        .from('user_storage')
        .delete()
        .eq('user_id', this.userId)
        .eq('key', key);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  }

  // Utility functions for common use cases
  static async saveBooking(bookingData: any): Promise<void> {
    if (!this.userId) return;
    await supabaseHelpers.createBooking({
      ...bookingData,
      userId: this.userId
    });
  }

  static async getBookings(): Promise<any[]> {
    if (!this.userId) return [];
    return await supabaseHelpers.getUserBookings(this.userId);
  }

  static async saveSearch(searchData: any): Promise<void> {
    if (!this.userId) return;
    await supabaseHelpers.saveSearch(this.userId, searchData);
  }

  static async getSavedSearches(): Promise<any[]> {
    if (!this.userId) return [];
    return await supabaseHelpers.getSavedSearches(this.userId);
  }

  static async addToWishlist(propertyData: any): Promise<void> {
    if (!this.userId) return;
    await supabaseHelpers.addToWishlist(this.userId, propertyData);
  }

  static async getWishlist(): Promise<any[]> {
    if (!this.userId) return [];
    return await supabaseHelpers.getWishlist(this.userId);
  }
}

export default SupabaseStorage;
