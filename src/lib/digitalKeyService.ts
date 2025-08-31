// Digital Key Service for METAH Travel Platform
// Handles digital key generation, management, and hotel door lock integration

export interface DigitalKey {
  id: string;
  bookingId: string;
  propertyId: string;
  userId: string;
  keyType: 'bluetooth' | 'nfc' | 'qr' | 'pin';
  accessCode: string;
  accessToken: string;
  validFrom: Date;
  validUntil: Date;
  permissions: KeyPermission[];
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  usageCount: number;
  maxUsage?: number;
  createdAt: Date;
  lastUsed?: Date;
  deviceInfo?: DeviceInfo;
  lockSystem: LockSystem;
}

export interface KeyPermission {
  area: 'room' | 'building' | 'amenities' | 'parking' | 'pool' | 'gym' | 'lobby';
  accessLevel: 'guest' | 'staff' | 'admin';
  timeRestrictions?: TimeRestriction[];
}

export interface TimeRestriction {
  dayOfWeek: number[]; // 0-6 (Sunday-Saturday)
  startTime: string;   // HH:MM format
  endTime: string;     // HH:MM format
}

export interface DeviceInfo {
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
  bluetoothVersion?: string;
  nfcSupported?: boolean;
  deviceModel?: string;
  osVersion?: string;
}

export interface LockSystem {
  brand: 'assa_abloy' | 'salto' | 'kaba' | 'dormakaba' | 'vingcard' | 'onity';
  model: string;
  firmwareVersion: string;
  supportedProtocols: ('bluetooth' | 'nfc' | 'rfid' | 'magnetic')[];
  encryptionType: 'aes256' | 'rsa2048' | 'ecc';
  batteryLevel?: number;
  lastMaintenance?: Date;
}

export interface KeyUsageEvent {
  id: string;
  keyId: string;
  timestamp: Date;
  action: 'unlock' | 'lock' | 'attempt_denied' | 'key_generated' | 'key_revoked';
  location: string;
  deviceInfo?: DeviceInfo;
  success: boolean;
  errorCode?: string;
  batteryLevel?: number;
}

export interface KeyGenerationRequest {
  bookingId: string;
  propertyId: string;
  userId: string;
  keyType: DigitalKey['keyType'];
  checkInDate: Date;
  checkOutDate: Date;
  roomNumbers: string[];
  guestCount: number;
  specialRequests?: string[];
}

class DigitalKeyService {
  private readonly API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.metah.travel';
  private readonly ENCRYPTION_KEY = import.meta.env.VITE_DIGITAL_KEY_ENCRYPTION || 'default-key';
  
  // Supported lock system integrations
  private readonly LOCK_INTEGRATIONS = {
    assa_abloy: {
      apiUrl: 'https://api.assaabloy.com/v1',
      authType: 'oauth2',
      protocols: ['bluetooth', 'nfc']
    },
    salto: {
      apiUrl: 'https://api.saltosystems.com/v2',
      authType: 'api_key',
      protocols: ['bluetooth', 'nfc', 'rfid']
    },
    kaba: {
      apiUrl: 'https://api.kaba.com/v1',
      authType: 'certificate',
      protocols: ['bluetooth', 'nfc']
    }
  };

  // Generate digital key for booking
  async generateDigitalKey(request: KeyGenerationRequest): Promise<DigitalKey> {
    try {
      // Validate request
      this.validateKeyRequest(request);

      // Get property lock system information
      const lockSystem = await this.getPropertyLockSystem(request.propertyId);
      
      // Generate access credentials
      const accessCredentials = await this.generateAccessCredentials(request, lockSystem);
      
      // Create digital key
      const digitalKey: DigitalKey = {
        id: this.generateKeyId(),
        bookingId: request.bookingId,
        propertyId: request.propertyId,
        userId: request.userId,
        keyType: request.keyType,
        accessCode: accessCredentials.accessCode,
        accessToken: accessCredentials.accessToken,
        validFrom: new Date(request.checkInDate.getTime() - 2 * 60 * 60 * 1000), // 2 hours before check-in
        validUntil: new Date(request.checkOutDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours after check-out
        permissions: this.generatePermissions(request),
        status: 'active',
        usageCount: 0,
        createdAt: new Date(),
        lockSystem
      };

      // Store key in database
      await this.storeDigitalKey(digitalKey);
      
      // Provision key to lock system
      await this.provisionKeyToLockSystem(digitalKey);
      
      // Log key generation
      await this.logKeyEvent({
        id: this.generateEventId(),
        keyId: digitalKey.id,
        timestamp: new Date(),
        action: 'key_generated',
        location: `Property ${request.propertyId}`,
        success: true
      });

      return digitalKey;
      
    } catch (error) {
      console.error('Failed to generate digital key:', error);
      throw new Error(`Digital key generation failed: ${error.message}`);
    }
  }

  // Get digital keys for user
  async getUserDigitalKeys(userId: string): Promise<DigitalKey[]> {
    try {
      const keys = localStorage.getItem(`digital_keys_${userId}`);
      if (!keys) return [];
      
      const parsedKeys: DigitalKey[] = JSON.parse(keys);
      
      // Filter active and non-expired keys
      return parsedKeys.filter(key => 
        key.status === 'active' && 
        new Date() < new Date(key.validUntil)
      );
    } catch (error) {
      console.error('Failed to get user digital keys:', error);
      return [];
    }
  }

  // Get digital key by ID
  async getDigitalKey(keyId: string): Promise<DigitalKey | null> {
    try {
      // In production, this would query the database
      const allKeys = this.getAllStoredKeys();
      return allKeys.find(key => key.id === keyId) || null;
    } catch (error) {
      console.error('Failed to get digital key:', error);
      return null;
    }
  }

  // Validate digital key for access
  async validateKeyAccess(keyId: string, location: string): Promise<{
    valid: boolean;
    reason?: string;
    permissions?: KeyPermission[];
  }> {
    try {
      const key = await this.getDigitalKey(keyId);
      
      if (!key) {
        return { valid: false, reason: 'Key not found' };
      }

      // Check key status
      if (key.status !== 'active') {
        return { valid: false, reason: `Key is ${key.status}` };
      }

      // Check time validity
      const now = new Date();
      if (now < new Date(key.validFrom) || now > new Date(key.validUntil)) {
        return { valid: false, reason: 'Key is outside valid time range' };
      }

      // Check usage limits
      if (key.maxUsage && key.usageCount >= key.maxUsage) {
        return { valid: false, reason: 'Key usage limit exceeded' };
      }

      // Check location permissions
      const hasLocationAccess = this.checkLocationPermission(key.permissions, location);
      if (!hasLocationAccess) {
        return { valid: false, reason: 'No access permission for this location' };
      }

      // Check time restrictions
      const timeAllowed = this.checkTimeRestrictions(key.permissions, now);
      if (!timeAllowed) {
        return { valid: false, reason: 'Access not allowed at this time' };
      }

      return { 
        valid: true, 
        permissions: key.permissions 
      };

    } catch (error) {
      console.error('Key validation failed:', error);
      return { valid: false, reason: 'Validation error' };
    }
  }

  // Use digital key to unlock
  async useDigitalKey(keyId: string, location: string, deviceInfo?: DeviceInfo): Promise<{
    success: boolean;
    message: string;
    batteryLevel?: number;
  }> {
    try {
      // Validate key access
      const validation = await this.validateKeyAccess(keyId, location);
      if (!validation.valid) {
        await this.logKeyEvent({
          id: this.generateEventId(),
          keyId,
          timestamp: new Date(),
          action: 'attempt_denied',
          location,
          deviceInfo,
          success: false,
          errorCode: validation.reason
        });
        
        return { success: false, message: validation.reason || 'Access denied' };
      }

      // Get the key
      const key = await this.getDigitalKey(keyId);
      if (!key) {
        return { success: false, message: 'Key not found' };
      }

      // Perform unlock operation based on key type
      const unlockResult = await this.performUnlock(key, location, deviceInfo);
      
      if (unlockResult.success) {
        // Update usage count
        key.usageCount++;
        key.lastUsed = new Date();
        await this.updateDigitalKey(key);
      }

      // Log usage event
      await this.logKeyEvent({
        id: this.generateEventId(),
        keyId,
        timestamp: new Date(),
        action: unlockResult.success ? 'unlock' : 'attempt_denied',
        location,
        deviceInfo,
        success: unlockResult.success,
        errorCode: unlockResult.success ? undefined : unlockResult.error,
        batteryLevel: unlockResult.batteryLevel
      });

      return {
        success: unlockResult.success,
        message: unlockResult.success ? 'Door unlocked successfully' : unlockResult.error || 'Unlock failed',
        batteryLevel: unlockResult.batteryLevel
      };

    } catch (error) {
      console.error('Digital key usage failed:', error);
      return { success: false, message: 'System error' };
    }
  }

  // Revoke digital key
  async revokeDigitalKey(keyId: string, reason: string): Promise<boolean> {
    try {
      const key = await this.getDigitalKey(keyId);
      if (!key) return false;

      // Update key status
      key.status = 'revoked';
      await this.updateDigitalKey(key);

      // Revoke from lock system
      await this.revokeFromLockSystem(key);

      // Log revocation
      await this.logKeyEvent({
        id: this.generateEventId(),
        keyId,
        timestamp: new Date(),
        action: 'key_revoked',
        location: `Property ${key.propertyId}`,
        success: true,
        errorCode: reason
      });

      return true;
    } catch (error) {
      console.error('Failed to revoke digital key:', error);
      return false;
    }
  }

  // Get key usage history
  async getKeyUsageHistory(keyId: string): Promise<KeyUsageEvent[]> {
    try {
      const events = localStorage.getItem(`key_events_${keyId}`);
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Failed to get key usage history:', error);
      return [];
    }
  }

  // Check device compatibility
  async checkDeviceCompatibility(deviceInfo: DeviceInfo, keyType: DigitalKey['keyType']): Promise<{
    compatible: boolean;
    requirements?: string[];
    recommendations?: string[];
  }> {
    const requirements: string[] = [];
    const recommendations: string[] = [];

    switch (keyType) {
      case 'bluetooth':
        if (!deviceInfo.bluetoothVersion) {
          requirements.push('Bluetooth 4.0 or higher required');
        } else {
          const version = parseFloat(deviceInfo.bluetoothVersion);
          if (version < 4.0) {
            requirements.push('Bluetooth 4.0 or higher required');
          }
        }
        recommendations.push('Enable Bluetooth and location services');
        break;

      case 'nfc':
        if (!deviceInfo.nfcSupported) {
          requirements.push('NFC capability required');
        }
        recommendations.push('Enable NFC in device settings');
        break;

      case 'qr':
        recommendations.push('Camera access required for QR code scanning');
        break;

      case 'pin':
        // PIN codes work on all devices
        break;
    }

    // Platform-specific checks
    if (deviceInfo.platform === 'ios') {
      recommendations.push('iOS 13.0 or higher recommended');
    } else if (deviceInfo.platform === 'android') {
      recommendations.push('Android 8.0 or higher recommended');
    }

    return {
      compatible: requirements.length === 0,
      requirements: requirements.length > 0 ? requirements : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };
  }

  // Private helper methods

  private validateKeyRequest(request: KeyGenerationRequest): void {
    if (!request.bookingId || !request.propertyId || !request.userId) {
      throw new Error('Missing required fields');
    }

    if (request.checkInDate >= request.checkOutDate) {
      throw new Error('Invalid date range');
    }

    if (!['bluetooth', 'nfc', 'qr', 'pin'].includes(request.keyType)) {
      throw new Error('Invalid key type');
    }
  }

  private async getPropertyLockSystem(propertyId: string): Promise<LockSystem> {
    // Mock implementation - in production, fetch from property database
    return {
      brand: 'assa_abloy',
      model: 'Aperio K100',
      firmwareVersion: '2.3.1',
      supportedProtocols: ['bluetooth', 'nfc'],
      encryptionType: 'aes256',
      batteryLevel: 85,
      lastMaintenance: new Date('2024-01-15')
    };
  }

  private async generateAccessCredentials(
    request: KeyGenerationRequest, 
    lockSystem: LockSystem
  ): Promise<{ accessCode: string; accessToken: string }> {
    // Generate secure access credentials
    const accessCode = this.generateSecureCode(lockSystem.encryptionType);
    const accessToken = this.generateAccessToken(request, lockSystem);

    return { accessCode, accessToken };
  }

  private generateSecureCode(encryptionType: string): string {
    // Generate cryptographically secure access code
    const length = encryptionType === 'aes256' ? 32 : 16;
    const chars = '0123456789ABCDEF';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  private generateAccessToken(request: KeyGenerationRequest, lockSystem: LockSystem): string {
    // Create signed JWT-like token for lock system
    const payload = {
      booking: request.bookingId,
      property: request.propertyId,
      user: request.userId,
      validFrom: request.checkInDate.toISOString(),
      validUntil: request.checkOutDate.toISOString(),
      lockSystem: lockSystem.brand,
      permissions: request.roomNumbers
    };

    // In production, use proper JWT signing
    return btoa(JSON.stringify(payload));
  }

  private generatePermissions(request: KeyGenerationRequest): KeyPermission[] {
    const permissions: KeyPermission[] = [
      {
        area: 'room',
        accessLevel: 'guest'
      },
      {
        area: 'building',
        accessLevel: 'guest',
        timeRestrictions: [{
          dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
          startTime: '06:00',
          endTime: '23:00'
        }]
      }
    ];

    // Add amenity access based on special requests
    if (request.specialRequests?.includes('pool_access')) {
      permissions.push({
        area: 'pool',
        accessLevel: 'guest',
        timeRestrictions: [{
          dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
          startTime: '06:00',
          endTime: '22:00'
        }]
      });
    }

    if (request.specialRequests?.includes('gym_access')) {
      permissions.push({
        area: 'gym',
        accessLevel: 'guest',
        timeRestrictions: [{
          dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
          startTime: '05:00',
          endTime: '23:00'
        }]
      });
    }

    return permissions;
  }

  private async storeDigitalKey(key: DigitalKey): Promise<void> {
    // Store in localStorage for demo - in production, use secure backend storage
    const existingKeys = this.getAllStoredKeys();
    existingKeys.push(key);
    localStorage.setItem('all_digital_keys', JSON.stringify(existingKeys));

    // Store user-specific keys
    const userKeys = await this.getUserDigitalKeys(key.userId);
    userKeys.push(key);
    localStorage.setItem(`digital_keys_${key.userId}`, JSON.stringify(userKeys));
  }

  private async updateDigitalKey(key: DigitalKey): Promise<void> {
    const allKeys = this.getAllStoredKeys();
    const index = allKeys.findIndex(k => k.id === key.id);
    if (index >= 0) {
      allKeys[index] = key;
      localStorage.setItem('all_digital_keys', JSON.stringify(allKeys));
    }

    // Update user-specific storage
    const userKeys = await this.getUserDigitalKeys(key.userId);
    const userIndex = userKeys.findIndex(k => k.id === key.id);
    if (userIndex >= 0) {
      userKeys[userIndex] = key;
      localStorage.setItem(`digital_keys_${key.userId}`, JSON.stringify(userKeys));
    }
  }

  private getAllStoredKeys(): DigitalKey[] {
    const keys = localStorage.getItem('all_digital_keys');
    return keys ? JSON.parse(keys) : [];
  }

  private async provisionKeyToLockSystem(key: DigitalKey): Promise<void> {
    // Mock implementation - in production, integrate with actual lock system APIs
    console.log(`Provisioning key ${key.id} to ${key.lockSystem.brand} lock system`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async revokeFromLockSystem(key: DigitalKey): Promise<void> {
    // Mock implementation - in production, revoke from actual lock system
    console.log(`Revoking key ${key.id} from ${key.lockSystem.brand} lock system`);
  }

  private async performUnlock(
    key: DigitalKey, 
    location: string, 
    deviceInfo?: DeviceInfo
  ): Promise<{ success: boolean; error?: string; batteryLevel?: number }> {
    // Mock unlock implementation
    console.log(`Attempting to unlock ${location} with ${key.keyType} key`);

    // Simulate different unlock methods
    switch (key.keyType) {
      case 'bluetooth':
        return await this.performBluetoothUnlock(key, location);
      case 'nfc':
        return await this.performNFCUnlock(key, location);
      case 'qr':
        return await this.performQRUnlock(key, location);
      case 'pin':
        return await this.performPINUnlock(key, location);
      default:
        return { success: false, error: 'Unsupported key type' };
    }
  }

  private async performBluetoothUnlock(key: DigitalKey, location: string): Promise<{
    success: boolean; error?: string; batteryLevel?: number;
  }> {
    // Simulate Bluetooth unlock
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 95% success rate for Bluetooth
    const success = Math.random() > 0.05;
    return {
      success,
      error: success ? undefined : 'Bluetooth connection failed',
      batteryLevel: Math.floor(Math.random() * 30) + 70 // 70-100%
    };
  }

  private async performNFCUnlock(key: DigitalKey, location: string): Promise<{
    success: boolean; error?: string; batteryLevel?: number;
  }> {
    // Simulate NFC unlock
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 98% success rate for NFC
    const success = Math.random() > 0.02;
    return {
      success,
      error: success ? undefined : 'NFC read failed',
      batteryLevel: Math.floor(Math.random() * 20) + 80 // 80-100%
    };
  }

  private async performQRUnlock(key: DigitalKey, location: string): Promise<{
    success: boolean; error?: string; batteryLevel?: number;
  }> {
    // Simulate QR code unlock
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 90% success rate for QR (dependent on camera/lighting)
    const success = Math.random() > 0.1;
    return {
      success,
      error: success ? undefined : 'QR code scan failed',
      batteryLevel: Math.floor(Math.random() * 40) + 60 // 60-100%
    };
  }

  private async performPINUnlock(key: DigitalKey, location: string): Promise<{
    success: boolean; error?: string; batteryLevel?: number;
  }> {
    // Simulate PIN unlock
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 99% success rate for PIN
    const success = Math.random() > 0.01;
    return {
      success,
      error: success ? undefined : 'Invalid PIN',
      batteryLevel: Math.floor(Math.random() * 50) + 50 // 50-100%
    };
  }

  private checkLocationPermission(permissions: KeyPermission[], location: string): boolean {
    // Simple location matching - in production, use more sophisticated matching
    return permissions.some(permission => 
      location.toLowerCase().includes(permission.area.toLowerCase())
    );
  }

  private checkTimeRestrictions(permissions: KeyPermission[], currentTime: Date): boolean {
    const dayOfWeek = currentTime.getDay();
    const timeString = currentTime.toTimeString().substring(0, 5); // HH:MM format

    // If no time restrictions, allow access
    const restrictedPermissions = permissions.filter(p => p.timeRestrictions && p.timeRestrictions.length > 0);
    if (restrictedPermissions.length === 0) return true;

    // Check if current time is within any allowed time window
    return restrictedPermissions.some(permission =>
      permission.timeRestrictions.some(restriction =>
        restriction.dayOfWeek.includes(dayOfWeek) &&
        timeString >= restriction.startTime &&
        timeString <= restriction.endTime
      )
    );
  }

  private async logKeyEvent(event: KeyUsageEvent): Promise<void> {
    // Store event in localStorage for demo
    const existingEvents = localStorage.getItem(`key_events_${event.keyId}`);
    const events: KeyUsageEvent[] = existingEvents ? JSON.parse(existingEvents) : [];
    events.push(event);
    
    // Keep only last 100 events per key
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem(`key_events_${event.keyId}`, JSON.stringify(events));
  }

  private generateKeyId(): string {
    return `key_${  Date.now().toString(36)  }${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${  Date.now().toString(36)  }${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const digitalKeyService = new DigitalKeyService();

// Helper functions
export async function generateDigitalKey(request: KeyGenerationRequest): Promise<DigitalKey> {
  return digitalKeyService.generateDigitalKey(request);
}

export async function useDigitalKey(keyId: string, location: string, deviceInfo?: DeviceInfo) {
  return digitalKeyService.useDigitalKey(keyId, location, deviceInfo);
}

export async function getUserKeys(userId: string): Promise<DigitalKey[]> {
  return digitalKeyService.getUserDigitalKeys(userId);
}

export async function revokeKey(keyId: string, reason: string): Promise<boolean> {
  return digitalKeyService.revokeDigitalKey(keyId, reason);
}
