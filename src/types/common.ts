// Common type definitions to replace 'any' types throughout the application

export interface GenericApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface EventHandler {
  (event: Event): void;
}

export interface FormHandler {
  (event: React.FormEvent<HTMLFormElement>): void;
}

export interface ChangeHandler {
  (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void;
}

export interface ClickHandler {
  (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement>): void;
}

export interface KeyboardHandler {
  (event: React.KeyboardEvent): void;
}

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchFilters {
  [key: string]: string | number | boolean | string[] | number[];
}

export interface LocalStorageData {
  [key: string]: unknown;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface TouchPosition {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  startPosition: TouchPosition;
  currentPosition: TouchPosition;
}

export interface MediaQuery {
  matches: boolean;
  media: string;
}

export interface AsyncOperation<T = unknown> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'agent' | 'system';
  type?: 'text' | 'file' | 'image';
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export interface PermissionState {
  granted: boolean;
  prompt: boolean;
  denied: boolean;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface NetworkInfo {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface ServiceWorkerMessage {
  type: string;
  payload: unknown;
}

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  fallback?: boolean;
}

export interface PaymentMethodData {
  type: string;
  details: Record<string, unknown>;
}

export interface LocationData {
  address: string;
  city: string;
  country: string;
  coordinates: Coordinates;
  postalCode?: string;
  region?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}

export interface DocumentData {
  id: string;
  type: string;
  url: string;
  filename: string;
  uploadedAt: Date;
  size: number;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  address?: LocationData;
}

export interface CompanyInfo extends ContactInfo {
  website?: string;
  logo?: string;
  description?: string;
  founded?: Date;
}

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogImage?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: NavigationItem[];
  active?: boolean;
  disabled?: boolean;
}

export interface ThemeConfig {
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  flag: string;
}

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  rate?: number;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  variants: string[];
  assignment?: string;
  active: boolean;
}

export interface UserPreferences {
  theme: string;
  language: string;
  currency: string;
  notifications: boolean;
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    screenReader: boolean;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: Record<string, 'healthy' | 'degraded' | 'down'>;
  lastCheck: Date;
  uptime: number;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export interface TableColumn<T = unknown> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableProps<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationParams;
  sorting?: SortParams;
  onSort?: (params: SortParams) => void;
  onPageChange?: (page: number) => void;
}

export interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  href?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
}

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => Promise<FileUploadResponse[]>;
  onError?: (error: string) => void;
}

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  loading?: boolean;
}

export interface FilterProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  options: Record<string, FilterOption[]>;
  onReset?: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface StepperProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

export interface AccordionProps {
  items: { title: string; content: React.ReactNode }[];
  multiple?: boolean;
  defaultOpen?: number[];
}

export interface TabsProps {
  tabs: { label: string; content: React.ReactNode; disabled?: boolean }[];
  defaultTab?: number;
  onTabChange?: (index: number) => void;
}

export interface DialogProps extends ModalProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  footer?: React.ReactNode;
}

export interface DrawerProps extends ModalProps {
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  online?: boolean;
}

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | false;
}

export interface ErrorProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  code?: string | number;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}
