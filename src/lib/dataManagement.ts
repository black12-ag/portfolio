/**
 * Advanced Data Management System
 * Handles user data permissions, retention policies, and sync between reception and manager
 */

import { logger } from './enterpriseLogger';
import { EventBus } from './architectureCore';

// Data Access Levels
export enum DataAccessLevel {
  RECEPTION_ONLY = 'reception_only',
  RECEPTION_TEMPORARY = 'reception_temporary', // 24 hour access
  MANAGER_ONLY = 'manager_only',
  SHARED_ACCESS = 'shared_access'
}

// User Data with Permissions
export interface UserDataEntry {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  nationalId?: string;
  passportId?: string;
  imageBase64?: string;
  imageBase64Array?: string[];
  hasImage: boolean;
  imageCount?: number;
  
  // Permission and Access Control
  accessLevel: DataAccessLevel;
  managerPermissions: ManagerPermissions;
  
  // Timing and Retention
  createdAt: string;
  expiresAt?: string; // For temporary access
  lastAccessedAt: string;
  receptionAccessExpiresAt?: string; // 24 hour rule
  
  // Sync and Status
  syncStatus: 'pending' | 'synced' | 'failed';
  offlineCreated: boolean;
  lastSyncAttempt?: string;
  syncRetryCount: number;
  
  // Audit Trail
  createdBy: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
  accessHistory: AccessLogEntry[];
  
  // Data Source and Location
  dataSource: 'reception' | 'manager' | 'api';
  currentLocation: 'reception' | 'manager' | 'both';
  isMarkedForDeletion: boolean;
}

export interface ManagerPermissions {
  allowReceptionAccess: boolean;
  allowReceptionModify: boolean;
  allowReceptionDelete: boolean;
  temporaryAccessDuration: number; // hours
  requireManagerApproval: boolean;
  autoDeleteAfterExpiry: boolean;
}

export interface AccessLogEntry {
  timestamp: string;
  accessedBy: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'sync';
  location: 'reception' | 'manager';
  success: boolean;
  details?: string;
}

export interface DataRetentionPolicy {
  receptionTempAccessHours: number;
  managerRetentionDays: number;
  offlineRetentionDays: number;
  imageRetentionDays: number;
  auditLogRetentionDays: number;
  autoCleanupEnabled: boolean;
}

export interface SyncConfiguration {
  autoSyncIntervalMinutes: number;
  maxRetryAttempts: number;
  retryBackoffMultiplier: number;
  requireManagerApprovalForSync: boolean;
  syncOnlyWithPermission: boolean;
  prioritizeOfflineData: boolean;
}

class DataManagementSystem {
  private static instance: DataManagementSystem;
  private eventBus: EventBus;
  private retentionPolicy: DataRetentionPolicy;
  private syncConfig: SyncConfiguration;
  private cleanupTimer?: NodeJS.Timeout;
  private syncTimer?: NodeJS.Timeout;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.retentionPolicy = {
      receptionTempAccessHours: 24,
      managerRetentionDays: 365,
      offlineRetentionDays: 7,
      imageRetentionDays: 30,
      auditLogRetentionDays: 90,
      autoCleanupEnabled: true
    };
    
    this.syncConfig = {
      autoSyncIntervalMinutes: 5,
      maxRetryAttempts: 3,
      retryBackoffMultiplier: 2,
      requireManagerApprovalForSync: false,
      syncOnlyWithPermission: true,
      prioritizeOfflineData: true
    };

    this.initializeCleanupTimer();
    this.initializeSyncTimer();
    this.setupEventListeners();
  }

  static getInstance(): DataManagementSystem {
    if (!DataManagementSystem.instance) {
      DataManagementSystem.instance = new DataManagementSystem();
    }
    return DataManagementSystem.instance;
  }

  // Save user data with permission control
  async saveUserData(
    userData: Omit<UserDataEntry, 'id' | 'createdAt' | 'accessHistory'>, 
    createdBy: string,
    location: 'reception' | 'manager'
  ): Promise<UserDataEntry> {
    const now = new Date().toISOString();
    const dataId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate expiration based on access level and permissions
    const expiresAt = this.calculateExpirationTime(userData.accessLevel, userData.managerPermissions);
    const receptionAccessExpiresAt = this.calculateReceptionAccessExpiry(userData.managerPermissions);

    const userDataEntry: UserDataEntry = {
      ...userData,
      id: dataId,
      createdAt: now,
      expiresAt,
      lastAccessedAt: now,
      receptionAccessExpiresAt,
      syncStatus: navigator.onLine ? 'pending' : 'pending',
      offlineCreated: !navigator.onLine,
      syncRetryCount: 0,
      createdBy,
      lastModifiedBy: createdBy,
      lastModifiedAt: now,
      accessHistory: [{
        timestamp: now,
        accessedBy: createdBy,
        action: 'create',
        location,
        success: true,
        details: `User data created at ${location}`
      }],
      dataSource: location,
      currentLocation: location,
      isMarkedForDeletion: false
    };

    // Save to appropriate storage
    await this.saveToStorage(userDataEntry, location);
    
    // Log the operation
    logger.info('User data saved', {
      dataId,
      userId: userData.userId,
      location,
      accessLevel: userData.accessLevel,
      hasImage: userData.hasImage,
      offlineCreated: userDataEntry.offlineCreated
    });

    // Trigger sync if online and permissions allow
    if (navigator.onLine && this.canSync(userDataEntry)) {
      this.scheduleSync(userDataEntry);
    }

    // Emit event for UI updates
    this.eventBus.emit('userData:saved', userDataEntry);

    return userDataEntry;
  }

  // Get user data with permission checks
  async getUserData(
    dataId: string, 
    accessedBy: string, 
    location: 'reception' | 'manager'
  ): Promise<UserDataEntry | null> {
    const userData = await this.loadFromStorage(dataId, location);
    
    if (!userData) {
      return null;
    }

    // Check access permissions
    if (!this.checkAccessPermission(userData, location, 'view')) {
      logger.warn('Access denied to user data', {
        dataId,
        accessedBy,
        location,
        accessLevel: userData.accessLevel,
        reason: 'insufficient_permissions'
      });
      return null;
    }

    // Check if data has expired
    if (this.isDataExpired(userData, location)) {
      logger.info('Data access denied - expired', {
        dataId,
        location,
        expiresAt: userData.expiresAt,
        receptionAccessExpiresAt: userData.receptionAccessExpiresAt
      });
      
      // Move to manager-only if reception access expired
      if (location === 'reception' && userData.receptionAccessExpiresAt) {
        await this.moveToManagerOnly(userData);
      }
      
      return null;
    }

    // Update access history
    userData.lastAccessedAt = new Date().toISOString();
    userData.accessHistory.push({
      timestamp: new Date().toISOString(),
      accessedBy,
      action: 'view',
      location,
      success: true
    });

    await this.saveToStorage(userData, location);

    return userData;
  }

  // Update user data with permission checks
  async updateUserData(
    dataId: string,
    updates: Partial<UserDataEntry>,
    updatedBy: string,
    location: 'reception' | 'manager'
  ): Promise<UserDataEntry | null> {
    const userData = await this.loadFromStorage(dataId, location);
    
    if (!userData) {
      return null;
    }

    // Check update permissions
    if (!this.checkAccessPermission(userData, location, 'update')) {
      logger.warn('Update denied for user data', {
        dataId,
        updatedBy,
        location,
        reason: 'insufficient_permissions'
      });
      return null;
    }

    const now = new Date().toISOString();
    const updatedUserData: UserDataEntry = {
      ...userData,
      ...updates,
      lastModifiedBy: updatedBy,
      lastModifiedAt: now,
      lastAccessedAt: now,
      syncStatus: 'pending',
      accessHistory: [
        ...userData.accessHistory,
        {
          timestamp: now,
          accessedBy: updatedBy,
          action: 'update',
          location,
          success: true,
          details: `Data updated: ${Object.keys(updates).join(', ')}`
        }
      ]
    };

    await this.saveToStorage(updatedUserData, location);

    logger.info('User data updated', {
      dataId,
      updatedBy,
      location,
      fieldsUpdated: Object.keys(updates)
    });

    // Schedule sync if needed
    if (navigator.onLine && this.canSync(updatedUserData)) {
      this.scheduleSync(updatedUserData);
    }

    this.eventBus.emit('userData:updated', updatedUserData);

    return updatedUserData;
  }

  // Manager grants/revokes reception access
  async setReceptionPermissions(
    dataId: string,
    permissions: ManagerPermissions,
    managerId: string
  ): Promise<boolean> {
    const userData = await this.loadFromStorage(dataId, 'manager');
    
    if (!userData) {
      return false;
    }

    const now = new Date().toISOString();
    const newAccessLevel = permissions.allowReceptionAccess 
      ? DataAccessLevel.SHARED_ACCESS 
      : DataAccessLevel.MANAGER_ONLY;

    const updatedUserData: UserDataEntry = {
      ...userData,
      accessLevel: newAccessLevel,
      managerPermissions: permissions,
      receptionAccessExpiresAt: permissions.allowReceptionAccess 
        ? this.calculateReceptionAccessExpiry(permissions)
        : undefined,
      lastModifiedBy: managerId,
      lastModifiedAt: now,
      accessHistory: [
        ...userData.accessHistory,
        {
          timestamp: now,
          accessedBy: managerId,
          action: 'update',
          location: 'manager',
          success: true,
          details: `Reception permissions ${permissions.allowReceptionAccess ? 'granted' : 'revoked'}`
        }
      ]
    };

    await this.saveToStorage(updatedUserData, 'manager');

    // If granting access, copy to reception storage
    if (permissions.allowReceptionAccess) {
      await this.saveToStorage(updatedUserData, 'reception');
    } else {
      // If revoking access, remove from reception
      await this.removeFromStorage(dataId, 'reception');
    }

    logger.info('Reception permissions updated', {
      dataId,
      managerId,
      allowAccess: permissions.allowReceptionAccess,
      duration: permissions.temporaryAccessDuration
    });

    this.eventBus.emit('permissions:updated', {
      dataId,
      permissions,
      updatedBy: managerId
    });

    return true;
  }

  // Check if data has expired for specific location
  private isDataExpired(userData: UserDataEntry, location: 'reception' | 'manager'): boolean {
    const now = new Date();
    
    if (location === 'reception' && userData.receptionAccessExpiresAt) {
      return new Date(userData.receptionAccessExpiresAt) < now;
    }
    
    if (userData.expiresAt) {
      return new Date(userData.expiresAt) < now;
    }
    
    return false;
  }

  // Check access permissions
  private checkAccessPermission(
    userData: UserDataEntry, 
    location: 'reception' | 'manager', 
    action: 'view' | 'update' | 'delete'
  ): boolean {
    // Manager always has full access
    if (location === 'manager') {
      return true;
    }

    // Reception access depends on permissions and access level
    if (location === 'reception') {
      switch (userData.accessLevel) {
        case DataAccessLevel.MANAGER_ONLY:
          return false;
        
        case DataAccessLevel.RECEPTION_ONLY:
        case DataAccessLevel.SHARED_ACCESS:
          if (action === 'view') return true;
          if (action === 'update') return userData.managerPermissions.allowReceptionModify;
          if (action === 'delete') return userData.managerPermissions.allowReceptionDelete;
          break;
        
        case DataAccessLevel.RECEPTION_TEMPORARY:
          // Check if still within 24 hour window
          return !this.isDataExpired(userData, 'reception');
      }
    }

    return false;
  }

  // Calculate expiration times
  private calculateExpirationTime(accessLevel: DataAccessLevel, permissions: ManagerPermissions): string | undefined {
    const now = new Date();
    
    switch (accessLevel) {
      case DataAccessLevel.RECEPTION_TEMPORARY:
        return new Date(now.getTime() + this.retentionPolicy.receptionTempAccessHours * 60 * 60 * 1000).toISOString();
      
      case DataAccessLevel.MANAGER_ONLY:
        return new Date(now.getTime() + this.retentionPolicy.managerRetentionDays * 24 * 60 * 60 * 1000).toISOString();
      
      default:
        return undefined; // No expiration for permanent access
    }
  }

  private calculateReceptionAccessExpiry(permissions: ManagerPermissions): string | undefined {
    if (!permissions.allowReceptionAccess) {
      return undefined;
    }

    const now = new Date();
    const expiryHours = permissions.temporaryAccessDuration || this.retentionPolicy.receptionTempAccessHours;
    return new Date(now.getTime() + expiryHours * 60 * 60 * 1000).toISOString();
  }

  // Data cleanup and retention
  private async performCleanup(): Promise<void> {
    logger.info('Starting data cleanup process');

    const receptionData = await this.getAllStorageData('reception');
    const managerData = await this.getAllStorageData('manager');

    let cleanedCount = 0;

    // Clean reception data based on 24-hour rule
    for (const userData of receptionData) {
      if (this.shouldCleanFromReception(userData)) {
        await this.removeFromStorage(userData.id, 'reception');
        
        // Move to manager if not already there
        if (userData.currentLocation !== 'both') {
          userData.currentLocation = 'manager';
          userData.accessLevel = DataAccessLevel.MANAGER_ONLY;
          await this.saveToStorage(userData, 'manager');
        }
        
        cleanedCount++;
      }
    }

    // Clean manager data based on retention policy
    for (const userData of managerData) {
      if (this.shouldDeletePermanently(userData)) {
        await this.removeFromStorage(userData.id, 'manager');
        await this.removeFromStorage(userData.id, 'reception');
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('Data cleanup completed', { cleanedCount });
      this.eventBus.emit('data:cleanup', { cleanedCount });
    }
  }

  private shouldCleanFromReception(userData: UserDataEntry): boolean {
    // Don't clean if no internet (to preserve offline data)
    if (!navigator.onLine && userData.offlineCreated) {
      return false;
    }

    // Clean if reception access has expired
    if (userData.receptionAccessExpiresAt) {
      return new Date(userData.receptionAccessExpiresAt) < new Date();
    }

    // Clean temporary access after 24 hours
    if (userData.accessLevel === DataAccessLevel.RECEPTION_TEMPORARY) {
      const createdAt = new Date(userData.createdAt);
      const expiryTime = new Date(createdAt.getTime() + this.retentionPolicy.receptionTempAccessHours * 60 * 60 * 1000);
      return expiryTime < new Date();
    }

    return false;
  }

  private shouldDeletePermanently(userData: UserDataEntry): boolean {
    if (!userData.expiresAt) {
      return false;
    }

    return new Date(userData.expiresAt) < new Date();
  }

  // Storage operations
  private async saveToStorage(userData: UserDataEntry, location: 'reception' | 'manager'): Promise<void> {
    const storageKey = `${location}_user_data`;
    const existingData = await this.getAllStorageData(location);
    const updatedData = existingData.filter(item => item.id !== userData.id);
    updatedData.push(userData);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
      localStorage.setItem(`${storageKey}_timestamp`, new Date().toISOString());
    } catch (error) {
      logger.error('Failed to save user data to storage', { location, dataId: userData.id }, error as Error);
      throw error;
    }
  }

  private async loadFromStorage(dataId: string, location: 'reception' | 'manager'): Promise<UserDataEntry | null> {
    const allData = await this.getAllStorageData(location);
    return allData.find(item => item.id === dataId) || null;
  }

  private async removeFromStorage(dataId: string, location: 'reception' | 'manager'): Promise<void> {
    const storageKey = `${location}_user_data`;
    const existingData = await this.getAllStorageData(location);
    const filteredData = existingData.filter(item => item.id !== dataId);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(filteredData));
    } catch (error) {
      logger.error('Failed to remove user data from storage', { location, dataId }, error as Error);
    }
  }

  private async getAllStorageData(location: 'reception' | 'manager'): Promise<UserDataEntry[]> {
    const storageKey = `${location}_user_data`;
    
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('Failed to load user data from storage', { location }, error as Error);
      return [];
    }
  }

  // Sync operations
  private canSync(userData: UserDataEntry): boolean {
    if (!this.syncConfig.syncOnlyWithPermission) {
      return true;
    }

    // Can sync if shared access or manager approval not required
    return userData.accessLevel === DataAccessLevel.SHARED_ACCESS || 
           !userData.managerPermissions.requireManagerApproval;
  }

  private async scheduleSync(userData: UserDataEntry): Promise<void> {
    // Implement sync scheduling logic
    setTimeout(() => {
      this.performSync(userData);
    }, 1000); // Delay sync by 1 second
  }

  private async performSync(userData: UserDataEntry): Promise<void> {
    logger.info('Performing data sync', { dataId: userData.id });

    try {
      // Simulate API call for sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      userData.syncStatus = 'synced';
      userData.lastSyncAttempt = new Date().toISOString();
      userData.syncRetryCount = 0;
      
      await this.saveToStorage(userData, userData.dataSource);
      
      this.eventBus.emit('data:synced', userData);
      
    } catch (error) {
      userData.syncStatus = 'failed';
      userData.syncRetryCount++;
      userData.lastSyncAttempt = new Date().toISOString();
      
      logger.error('Data sync failed', { dataId: userData.id, retryCount: userData.syncRetryCount }, error as Error);
      
      // Schedule retry if under limit
      if (userData.syncRetryCount < this.syncConfig.maxRetryAttempts) {
        const retryDelay = this.syncConfig.retryBackoffMultiplier ** userData.syncRetryCount * 1000;
        setTimeout(() => this.performSync(userData), retryDelay);
      }
    }
  }

  private async moveToManagerOnly(userData: UserDataEntry): Promise<void> {
    userData.accessLevel = DataAccessLevel.MANAGER_ONLY;
    userData.currentLocation = 'manager';
    userData.receptionAccessExpiresAt = undefined;
    
    await this.saveToStorage(userData, 'manager');
    await this.removeFromStorage(userData.id, 'reception');
    
    logger.info('Data moved to manager-only access', { dataId: userData.id });
    this.eventBus.emit('data:movedToManager', userData);
  }

  // Timer setup
  private initializeCleanupTimer(): void {
    if (this.retentionPolicy.autoCleanupEnabled) {
      this.cleanupTimer = setInterval(() => {
        this.performCleanup();
      }, 60 * 60 * 1000); // Run cleanup every hour
    }
  }

  private initializeSyncTimer(): void {
    this.syncTimer = setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingData();
      }
    }, this.syncConfig.autoSyncIntervalMinutes * 60 * 1000);
  }

  private async syncPendingData(): Promise<void> {
    const receptionData = await this.getAllStorageData('reception');
    const managerData = await this.getAllStorageData('manager');
    
    const pendingData = [...receptionData, ...managerData].filter(
      userData => userData.syncStatus === 'pending' || userData.syncStatus === 'failed'
    );

    for (const userData of pendingData) {
      if (this.canSync(userData)) {
        await this.performSync(userData);
      }
    }
  }

  private setupEventListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      logger.info('Connection restored - starting sync');
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      logger.info('Connection lost - data will be stored locally');
    });
  }

  // Public API methods
  async getAllUserData(location: 'reception' | 'manager', accessedBy: string): Promise<UserDataEntry[]> {
    const allData = await this.getAllStorageData(location);
    const accessibleData: UserDataEntry[] = [];

    for (const userData of allData) {
      if (this.checkAccessPermission(userData, location, 'view') && !this.isDataExpired(userData, location)) {
        accessibleData.push(userData);
      }
    }

    return accessibleData;
  }

  async getDataStatistics(location: 'reception' | 'manager'): Promise<any> {
    const allData = await this.getAllStorageData(location);
    
    return {
      total: allData.length,
      withImages: allData.filter(d => d.hasImage).length,
      offlineCreated: allData.filter(d => d.offlineCreated).length,
      pendingSync: allData.filter(d => d.syncStatus === 'pending').length,
      expired: allData.filter(d => this.isDataExpired(d, location)).length,
      accessLevels: {
        receptionOnly: allData.filter(d => d.accessLevel === DataAccessLevel.RECEPTION_ONLY).length,
        managerOnly: allData.filter(d => d.accessLevel === DataAccessLevel.MANAGER_ONLY).length,
        shared: allData.filter(d => d.accessLevel === DataAccessLevel.SHARED_ACCESS).length,
        temporary: allData.filter(d => d.accessLevel === DataAccessLevel.RECEPTION_TEMPORARY).length
      }
    };
  }

  // Cleanup
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
  }
}

// Export singleton instance
export const dataManager = DataManagementSystem.getInstance();

// Helper functions for components
export const saveUserDataWithPermissions = (userData: unknown, createdBy: string, location: 'reception' | 'manager') => {
  return dataManager.saveUserData(userData, createdBy, location);
};

export const getUserDataWithPermissions = (dataId: string, accessedBy: string, location: 'reception' | 'manager') => {
  return dataManager.getUserData(dataId, accessedBy, location);
};

export const updateUserDataWithPermissions = (dataId: string, updates: unknown, updatedBy: string, location: 'reception' | 'manager') => {
  return dataManager.updateUserData(dataId, updates, updatedBy, location);
};

export const setReceptionDataPermissions = (dataId: string, permissions: ManagerPermissions, managerId: string) => {
  return dataManager.setReceptionPermissions(dataId, permissions, managerId);
};

export const getAllUserDataWithPermissions = (location: 'reception' | 'manager', accessedBy: string) => {
  return dataManager.getAllUserData(location, accessedBy);
};

export const getDataStatistics = (location: 'reception' | 'manager') => {
  return dataManager.getDataStatistics(location);
};
