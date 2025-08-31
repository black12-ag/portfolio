import { HotelImage, LiteApiImage } from '@/types/image.types';

/**
 * Transforms a simple URL string into a HotelImage object for OptimizedImage component
 */
export function createHotelImageFromUrl(
  url: string,
  hotelId: string,
  alt?: string,
  category?: 'room' | 'exterior' | 'interior' | 'amenity' | 'dining' | 'other'
): HotelImage {
  // Guard against undefined, null, or empty URLs
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return createPlaceholderHotelImage(hotelId, alt || 'Hotel');
  }

  const filename = url.split('/').pop()?.split('?')[0] || Math.random().toString(36).slice(2);

  return {
    id: `${hotelId}-${filename}`,
    url,
    alt: alt || 'Hotel image',
    source: 'liteapi',
    originalUrl: url,
    hotelId,
    category: category || 'other',
    // Try to extract dimensions if available in URL params
    width: extractDimensionFromUrl(url, 'w') || undefined,
    height: extractDimensionFromUrl(url, 'h') || undefined,
    format: getImageFormatFromUrl(url),
    uploadedAt: new Date(),
    lastModified: new Date()
  } as LiteApiImage;
}

/**
 * Transforms an array of URL strings into HotelImage objects
 */
export function createHotelImagesFromUrls(
  urls: string[],
  hotelId: string,
  hotelName?: string
): HotelImage[] {
  return urls.map((url, index) => {
    // Determine category based on index (first few images are usually exterior)
    let category: 'room' | 'exterior' | 'interior' | 'amenity' | 'dining' | 'other' = 'other';
    if (index === 0) category = 'exterior';
    else if (index <= 2) category = 'exterior';
    else if (index <= 5) category = 'interior';
    else category = 'room';

    return createHotelImageFromUrl(
      url,
      hotelId,
      `${hotelName || 'Hotel'} - ${category} view ${index + 1}`,
      category
    );
  });
}

/**
 * Creates a fallback/placeholder HotelImage when no images are available
 */
export function createPlaceholderHotelImage(hotelId: string, hotelName?: string): HotelImage {
  return {
    id: `${hotelId}-placeholder`,
    url: '/placeholder-hotel.jpg', // You can create a placeholder image file
    alt: `${hotelName || 'Hotel'} - Image coming soon`,
    source: 'manual',
    originalFilename: 'placeholder.jpg',
    uploadedBy: 'system',
    hotelId,
    category: 'other',
    width: 400,
    height: 300,
    aspectRatio: 4/3,
    format: 'jpeg',
    uploadedAt: new Date(),
    lastModified: new Date()
  } as any;
}

/**
 * Ensures there's always at least one image, using placeholder if needed
 */
export function ensureHotelImages(
  urls: string[],
  hotelId: string,
  hotelName?: string
): HotelImage[] {
  if (!urls || urls.length === 0) {
    return [createPlaceholderHotelImage(hotelId, hotelName)];
  }

  // Filter out invalid URLs
  const validUrls = urls.filter(url => url && typeof url === 'string' && url.trim().length > 0);
  
  if (validUrls.length === 0) {
    return [createPlaceholderHotelImage(hotelId, hotelName)];
  }

  return createHotelImagesFromUrls(validUrls, hotelId, hotelName);
}

// Helper functions
function extractDimensionFromUrl(url: string, param: string): number | undefined {
  try {
    if (!url || typeof url !== 'string') return undefined;
    const urlObj = new URL(url);
    const value = urlObj.searchParams.get(param);
    return value ? parseInt(value, 10) : undefined;
  } catch {
    return undefined;
  }
}

function getImageFormatFromUrl(url: string): 'jpeg' | 'jpg' | 'png' | 'webp' | 'avif' | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const extension = url.toLowerCase().split('.').pop()?.split('?')[0];
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'avif':
      return 'avif';
    default:
      return undefined;
  }
}
