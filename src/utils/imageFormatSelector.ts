export class ImageFormatSelector {
  private readonly formatSupport = {
    avif: { chrome: 85, firefox: 93, safari: 16, edge: 85 },
    webp: { chrome: 23, firefox: 65, safari: 14, edge: 18 },
    jpeg: { chrome: 1, firefox: 1, safari: 1, edge: 1 },
    png: { chrome: 1, firefox: 1, safari: 1, edge: 1 },
  } as const;

  selectOptimalFormat(
    userAgent: string,
    imageType: 'photo' | 'graphic' | 'icon',
    hasTransparency = false
  ) {
    const info = this.parseBrowserInfo(userAgent);
    const supported = this.getSupportedFormats(info);

    let primary = 'jpeg';
    let fallback = 'jpeg';

    if (hasTransparency) {
      primary = supported.includes('avif') ? 'avif' : supported.includes('webp') ? 'webp' : 'png';
      fallback = 'png';
    } else {
      if (supported.includes('avif')) primary = 'avif';
      else if (supported.includes('webp')) primary = 'webp';
      else primary = 'jpeg';
      fallback = 'jpeg';
    }

    const sources: Array<{ format: string; type: string }> = [];
    if (supported.includes('avif') && primary !== 'avif') sources.push({ format: 'avif', type: 'image/avif' });
    if (supported.includes('webp') && primary !== 'webp') sources.push({ format: 'webp', type: 'image/webp' });
    sources.push({ format: primary, type: `image/${primary}` });

    return { primary, fallback, sources };
  }

  private parseBrowserInfo(uaRaw: string) {
    const ua = uaRaw.toLowerCase();
    let browser = 'unknown';
    let version = 0;

    if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = 'chrome';
      version = parseInt(ua.match(/chrome\/(\d+)/)?.[1] || '0');
    } else if (ua.includes('firefox')) {
      browser = 'firefox';
      version = parseInt(ua.match(/firefox\/(\d+)/)?.[1] || '0');
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'safari';
      version = parseInt(ua.match(/version\/(\d+)/)?.[1] || '0');
    } else if (ua.includes('edg')) {
      browser = 'edge';
      version = parseInt(ua.match(/edg\/(\d+)/)?.[1] || '0');
    }

    return { browser, version } as const;
  }

  private getSupportedFormats(info: { browser: string; version: number }) {
    const supported = ['jpeg', 'png'];
    for (const [format, req] of Object.entries(this.formatSupport)) {
      if (format === 'jpeg' || format === 'png') continue;
      const min = (req as any)[info.browser];
      if (typeof min === 'number' && info.version >= min) supported.push(format);
    }
    return supported;
  }
}

export const imageFormatSelector = new ImageFormatSelector();
