// Image type definitions for hotel and property images

export interface BaseImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  fileSize?: number;
  format?: 'jpeg' | 'jpg' | 'png' | 'webp' | 'avif';
  quality?: number;
  uploadedAt?: Date;
  lastModified?: Date;
}

export interface LiteApiImage extends BaseImage {
  source: 'liteapi';
  originalUrl: string;
  liteApiImageId?: string;
  category?: 'room' | 'exterior' | 'interior' | 'amenity' | 'dining' | 'other';
  roomTypeId?: string;
  hotelId: string;
}

export interface ManualImage extends BaseImage {
  source: 'manual';
  originalFilename: string;
  uploadedBy: string;
  category: 'room' | 'exterior' | 'interior' | 'amenity' | 'dining' | 'other';
  roomTypeId?: string;
  hotelId: string;
  thumbnails?: ImageThumbnail[];
  metadata?: ImageMetadata;
}

export interface ImageThumbnail {
  size: 'small' | 'medium' | 'large' | 'xlarge';
  url: string;
  width: number;
  height: number;
  fileSize?: number;
}

export interface ImageMetadata {
  exif?: Record<string, unknown>;
  colorProfile?: string;
  dominantColors?: string[];
  averageColor?: string;
  hasTransparency?: boolean;
  isAnimated?: boolean;
}

export interface ImageDisplayOptions {
  lazy?: boolean;
  placeholder?: 'blur' | 'color' | 'skeleton';
  priority?: boolean;
  sizes?: string;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export type HotelImage = LiteApiImage | ManualImage;
