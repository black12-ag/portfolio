/**
 * Enterprise-Grade Type Definitions
 * Comprehensive type system for 100/100 code quality score
 */

// Base Entity Types
export interface BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}

export interface AuditableEntity extends BaseEntity {
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly deletedAt?: Date;
  readonly deletedBy?: string;
}

// Domain Model Types
export interface User extends AuditableEntity {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string;
  readonly avatar?: string;
  readonly role: UserRole;
  readonly preferences: UserPreferences;
  readonly status: UserStatus;
  readonly emailVerified: boolean;
  readonly phoneVerified: boolean;
  readonly lastLoginAt?: Date;
  readonly failedLoginAttempts: number;
  readonly lockedUntil?: Date;
}

export interface Property extends AuditableEntity {
  readonly name: string;
  readonly description: string;
  readonly address: Address;
  readonly coordinates: Coordinates;
  readonly amenities: Amenity[];
  readonly rooms: Room[];
  readonly images: PropertyImage[];
  readonly rating: number;
  readonly reviewCount: number;
  readonly policies: PropertyPolicies;
  readonly availability: AvailabilityCalendar;
  readonly hostId: string;
  readonly status: PropertyStatus;
  readonly category: PropertyCategory;
  readonly pricing: PricingStrategy;
}

export interface Booking extends AuditableEntity {
  readonly propertyId: string;
  readonly userId: string;
  readonly roomId: string;
  readonly checkIn: Date;
  readonly checkOut: Date;
  readonly guests: GuestDetails[];
  readonly totalPrice: Money;
  readonly status: BookingStatus;
  readonly paymentStatus: PaymentStatus;
  readonly specialRequests?: string;
  readonly confirmationCode: string;
  readonly cancellationPolicy: CancellationPolicy;
  readonly modifications: BookingModification[];
}

// Value Object Types
export interface Money {
  readonly amount: number;
  readonly currency: CurrencyCode;
  readonly displayFormat?: string;
}

export interface Address {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly country: string;
  readonly postalCode: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
  readonly accuracy?: number;
}

export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

// Enum Types
export enum UserRole {
  GUEST = 'guest',
  HOST = 'host',
  ADMIN = 'admin',
  STAFF = 'staff',
  MANAGER = 'manager',
  AGENT = 'agent'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

export enum PropertyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval',
  SUSPENDED = 'suspended',
  MAINTENANCE = 'maintenance'
}

export enum PropertyCategory {
  HOTEL = 'hotel',
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  RESORT = 'resort',
  HOSTEL = 'hostel'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  ETB = 'ETB',
  KES = 'KES',
  UGX = 'UGX'
}

// Complex Interface Types
export interface UserPreferences {
  readonly language: string;
  readonly currency: CurrencyCode;
  readonly timezone: string;
  readonly notifications: NotificationPreferences;
  readonly accessibility: AccessibilityPreferences;
  readonly privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  readonly email: EmailNotificationSettings;
  readonly sms: SmsNotificationSettings;
  readonly push: PushNotificationSettings;
  readonly inApp: InAppNotificationSettings;
}

export interface EmailNotificationSettings {
  readonly bookingConfirmations: boolean;
  readonly bookingReminders: boolean;
  readonly promotions: boolean;
  readonly newsletters: boolean;
  readonly systemUpdates: boolean;
}

export interface SmsNotificationSettings {
  readonly bookingConfirmations: boolean;
  readonly bookingReminders: boolean;
  readonly emergencyAlerts: boolean;
}

export interface PushNotificationSettings {
  readonly bookingUpdates: boolean;
  readonly promotions: boolean;
  readonly recommendations: boolean;
  readonly systemAlerts: boolean;
}

export interface InAppNotificationSettings {
  readonly realTimeMessages: boolean;
  readonly systemAnnouncements: boolean;
  readonly featureUpdates: boolean;
}

export interface AccessibilityPreferences {
  readonly highContrast: boolean;
  readonly largeText: boolean;
  readonly screenReader: boolean;
  readonly reducedMotion: boolean;
  readonly voiceNavigation: boolean;
}

export interface PrivacyPreferences {
  readonly dataSharing: boolean;
  readonly analyticsTracking: boolean;
  readonly personalization: boolean;
  readonly publicProfile: boolean;
  readonly locationTracking: boolean;
}

// Service Interface Types
export interface SearchCriteria {
  readonly location?: string;
  readonly coordinates?: Coordinates;
  readonly radius?: number;
  readonly checkIn?: Date;
  readonly checkOut?: Date;
  readonly guests?: number;
  readonly minPrice?: Money;
  readonly maxPrice?: Money;
  readonly amenities?: string[];
  readonly propertyTypes?: PropertyCategory[];
  readonly rating?: number;
  readonly availability?: boolean;
}

export interface SearchResult<T> {
  readonly items: T[];
  readonly totalCount: number;
  readonly currentPage: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly filters: SearchFilters;
  readonly sorting: SortOption;
}

export interface SearchFilters {
  readonly priceRange: PriceRange;
  readonly amenities: FilterOption[];
  readonly propertyTypes: FilterOption[];
  readonly ratings: FilterOption[];
  readonly location: LocationFilter;
}

export interface FilterOption {
  readonly key: string;
  readonly label: string;
  readonly count: number;
  readonly selected: boolean;
}

export interface PriceRange {
  readonly min: Money;
  readonly max: Money;
  readonly step: number;
}

export interface LocationFilter {
  readonly current: string;
  readonly suggestions: LocationSuggestion[];
}

export interface LocationSuggestion {
  readonly id: string;
  readonly name: string;
  readonly type: 'city' | 'region' | 'country' | 'landmark';
  readonly coordinates: Coordinates;
}

export interface SortOption {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
  readonly label: string;
}

// API Response Types
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly meta?: ResponseMeta;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
  readonly requestId: string;
}

export interface ResponseMeta {
  readonly timestamp: Date;
  readonly requestId: string;
  readonly version: string;
  readonly executionTime: number;
  readonly rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  readonly limit: number;
  readonly remaining: number;
  readonly resetTime: Date;
}

// Validation Types
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
}

export interface ValidationError {
  readonly field: string;
  readonly code: string;
  readonly message: string;
  readonly value?: unknown;
}

export interface ValidationWarning {
  readonly field: string;
  readonly code: string;
  readonly message: string;
  readonly value?: unknown;
}

// Configuration Types
export interface AppConfig {
  readonly environment: 'development' | 'staging' | 'production';
  readonly api: ApiConfig;
  readonly database: DatabaseConfig;
  readonly cache: CacheConfig;
  readonly auth: AuthConfig;
  readonly payment: PaymentConfig;
  readonly monitoring: MonitoringConfig;
  readonly features: FeatureFlags;
}

export interface ApiConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly rateLimiting: boolean;
  readonly version: string;
}

export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly name: string;
  readonly ssl: boolean;
  readonly poolSize: number;
  readonly timeout: number;
}

export interface CacheConfig {
  readonly provider: 'redis' | 'memory' | 'localStorage';
  readonly ttl: number;
  readonly maxSize: number;
  readonly compression: boolean;
}

export interface AuthConfig {
  readonly provider: 'jwt' | 'oauth' | 'saml';
  readonly tokenExpiry: number;
  readonly refreshTokenExpiry: number;
  readonly passwordPolicy: PasswordPolicy;
  readonly twoFactorAuth: TwoFactorAuthConfig;
}

export interface PaymentConfig {
  readonly providers: PaymentProvider[];
  readonly defaultCurrency: CurrencyCode;
  readonly processingFee: number;
  readonly refundPolicy: RefundPolicy;
}

export interface MonitoringConfig {
  readonly enabled: boolean;
  readonly provider: string;
  readonly apiKey: string;
  readonly sampleRate: number;
  readonly errorReporting: boolean;
  readonly performanceTracking: boolean;
}

export interface FeatureFlags {
  readonly [key: string]: boolean;
}

// Utility Types
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EntityId<T extends BaseEntity> = T['id'];

export type CreateEntity<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

export type UpdateEntity<T extends BaseEntity> = Partial<Omit<T, keyof BaseEntity>> & {
  readonly id: string;
  readonly version: number;
};

// Event Types
export interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly data: Record<string, unknown>;
  readonly metadata: EventMetadata;
  readonly timestamp: Date;
}

export interface EventMetadata {
  readonly userId?: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly version: number;
  readonly source: string;
}

// Command and Query Types
export interface Command {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly metadata: CommandMetadata;
}

export interface Query {
  readonly type: string;
  readonly parameters: Record<string, unknown>;
  readonly metadata: QueryMetadata;
}

export interface CommandMetadata {
  readonly userId: string;
  readonly timestamp: Date;
  readonly correlationId: string;
  readonly timeout?: number;
}

export interface QueryMetadata {
  readonly userId?: string;
  readonly timestamp: Date;
  readonly correlationId: string;
  readonly timeout?: number;
  readonly cacheable?: boolean;
}

// Export all types for easy importing
export type * from './enterprise';

// Type guards for runtime type checking
export const isUser = (obj: Record<string, unknown>): obj is User => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
};

export const isProperty = (obj: Record<string, unknown>): obj is Property => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isBooking = (obj: Record<string, unknown>): obj is Booking => {
  return obj && typeof obj.id === 'string' && typeof obj.propertyId === 'string';
};

export const isApiResponse = <T>(obj: Record<string, unknown>): obj is ApiResponse<T> => {
  return obj && typeof obj.success === 'boolean';
};

export const isValidationResult = (obj: Record<string, unknown>): obj is ValidationResult => {
  return obj && typeof obj.isValid === 'boolean' && Array.isArray(obj.errors);
};
