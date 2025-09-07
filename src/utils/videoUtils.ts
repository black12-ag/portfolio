/**
 * Utility functions for handling video URLs (YouTube, Vimeo, local files)
 */

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'local' | 'unknown';
  embedUrl: string;
  thumbnailUrl: string;
  originalUrl: string;
  videoId?: string;
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Extract Vimeo video ID from various Vimeo URL formats
 */
export const getVimeoVideoId = (url: string): string | null => {
  const patterns = [
    /(?:vimeo\.com\/)([0-9]+)/,
    /(?:player\.vimeo\.com\/video\/)([0-9]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Get video information and embedding details
 */
export const parseVideoUrl = (url: string): VideoInfo => {
  if (!url) {
    return {
      type: 'unknown',
      embedUrl: '',
      thumbnailUrl: '',
      originalUrl: url
    };
  }

  // Check if it's a data URL (base64 local video)
  if (url.startsWith('data:video/')) {
    return {
      type: 'local',
      embedUrl: url,
      thumbnailUrl: '', // No thumbnail for data URLs
      originalUrl: url
    };
  }

  // Check if it's a local file
  if (url.startsWith('/') || url.startsWith('./') || !url.includes('://')) {
    return {
      type: 'local',
      embedUrl: url,
      thumbnailUrl: '', // Generate thumbnail from video if needed
      originalUrl: url
    };
  }

  // Check for YouTube
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return {
      type: 'youtube',
      videoId: youtubeId,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      originalUrl: url
    };
  }

  // Check for Vimeo
  const vimeoId = getVimeoVideoId(url);
  if (vimeoId) {
    return {
      type: 'vimeo',
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`,
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`, // Vimeo thumbnail service
      originalUrl: url
    };
  }

  // Default to local/direct URL
  return {
    type: 'local',
    embedUrl: url,
    thumbnailUrl: '',
    originalUrl: url
  };
};

/**
 * Check if URL is a valid video URL
 */
export const isValidVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Data URLs are valid
  if (url.startsWith('data:video/')) return true;
  
  // YouTube URLs
  if (getYouTubeVideoId(url)) return true;
  
  // Vimeo URLs
  if (getVimeoVideoId(url)) return true;
  
  // Local files or direct URLs
  if (url.match(/\.(mp4|webm|ogg|avi|mov|mkv)$/i)) return true;
  
  // Direct HTTP/HTTPS URLs
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  
  // Local paths
  if (url.startsWith('/') || url.startsWith('./')) return true;
  
  return false;
};

/**
 * Get video file size info (for display purposes)
 */
export const getVideoSizeInfo = (url: string): string => {
  if (url.startsWith('data:video/')) {
    // Calculate approximate size from base64 data
    const base64Data = url.split(',')[1] || '';
    const sizeInBytes = (base64Data.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)}KB`;
    } else {
      return `${sizeInMB.toFixed(1)}MB`;
    }
  }
  
  const videoInfo = parseVideoUrl(url);
  if (videoInfo.type === 'youtube' || videoInfo.type === 'vimeo') {
    return 'Streaming'; // External hosting
  }
  
  return 'Video'; // Unknown size for direct URLs
};

/**
 * Get recommended hosting method based on estimated file size
 */
export const getHostingRecommendation = (url: string): {
  method: 'direct' | 'youtube' | 'vimeo' | 'external';
  reason: string;
  color: 'green' | 'yellow' | 'red';
} => {
  if (!url) {
    return {
      method: 'direct',
      reason: 'No video provided',
      color: 'green'
    };
  }

  const videoInfo = parseVideoUrl(url);
  
  if (videoInfo.type === 'youtube') {
    return {
      method: 'youtube',
      reason: 'YouTube hosting - excellent for performance',
      color: 'green'
    };
  }
  
  if (videoInfo.type === 'vimeo') {
    return {
      method: 'vimeo', 
      reason: 'Vimeo hosting - great for professional content',
      color: 'green'
    };
  }
  
  if (url.startsWith('data:video/')) {
    const sizeInfo = getVideoSizeInfo(url);
    const sizeMatch = sizeInfo.match(/(\d+\.?\d*)([MK]B)/);
    
    if (sizeMatch) {
      const size = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2];
      
      if (unit === 'KB' || (unit === 'MB' && size < 50)) {
        return {
          method: 'direct',
          reason: `Small file (${sizeInfo}) - direct upload is perfect`,
          color: 'green'
        };
      } else if (unit === 'MB' && size < 200) {
        return {
          method: 'youtube',
          reason: `Medium file (${sizeInfo}) - external hosting recommended`,
          color: 'yellow'
        };
      } else {
        return {
          method: 'external',
          reason: `Large file (${sizeInfo}) - external hosting strongly recommended`,
          color: 'red'
        };
      }
    }
  }
  
  return {
    method: 'direct',
    reason: 'Direct hosting',
    color: 'green'
  };
};
