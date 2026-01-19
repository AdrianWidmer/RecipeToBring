export interface TikTokVideoInfo {
  title: string;
  description: string;
  thumbnail: string;
}

export async function fetchTikTokInfo(url: string): Promise<TikTokVideoInfo> {
  try {
    console.log('[DEBUG TikTok] Fetching:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.tiktok.com/',
      }
    });

    console.log('[DEBUG TikTok] Response status:', response.status);
    const html = await response.text();
    console.log('[DEBUG TikTok] HTML length:', html.length);
    console.log('[DEBUG TikTok] HTML preview (first 500 chars):', html.substring(0, 500));

    // Try to extract from __UNIVERSAL_DATA_FOR_REHYDRATION__ (TikTok's main data object)
    const universalDataMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/);
    if (universalDataMatch) {
      try {
        console.log('[DEBUG TikTok] Found __UNIVERSAL_DATA_FOR_REHYDRATION__');
        const universalData = JSON.parse(universalDataMatch[1]);
        console.log('[DEBUG TikTok] Universal data keys:', Object.keys(universalData));
        
        // Navigate to video details
        const videoDetail = universalData?.__DEFAULT_SCOPE__?.['webapp.video-detail'];
        if (videoDetail) {
          const itemInfo = videoDetail?.itemInfo?.itemStruct;
          if (itemInfo) {
            const title = itemInfo.desc || 'TikTok Recipe';
            const description = itemInfo.desc || '';
            const thumbnail = itemInfo.video?.cover || itemInfo.video?.dynamicCover || '';
            
            console.log('[DEBUG TikTok] Extracted from UNIVERSAL_DATA:', {
              titleLength: title.length,
              descriptionLength: description.length,
              descriptionPreview: description.substring(0, 200) + '...',
              hasThumbnail: !!thumbnail
            });
            
            if (description.length > 10) {
              return { title, description, thumbnail };
            }
          }
        }
      } catch (e) {
        console.error('[DEBUG TikTok] Failed to parse UNIVERSAL_DATA:', e);
      }
    } else {
      console.log('[DEBUG TikTok] __UNIVERSAL_DATA_FOR_REHYDRATION__ not found');
    }

    // Try to extract from JSON-LD
    const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    let jsonLdCount = 0;
    
    for (const match of jsonLdMatches) {
      jsonLdCount++;
      try {
        const jsonData = JSON.parse(match[1]);
        console.log('[DEBUG TikTok] Found JSON-LD #' + jsonLdCount + ', type:', jsonData['@type']);
        
        if (jsonData['@type'] === 'VideoObject') {
          const title = jsonData.name || jsonData.headline || 'TikTok Recipe';
          const description = jsonData.description || '';
          const thumbnail = jsonData.thumbnailUrl || jsonData.thumbnail?.url || '';
          
          console.log('[DEBUG TikTok] Extracted from JSON-LD:', {
            titleLength: title.length,
            descriptionLength: description.length,
            descriptionPreview: description.substring(0, 200) + '...'
          });
          
          if (description.length > 20) {
            return { title, description, thumbnail };
          }
        }
      } catch (e) {
        console.log('[DEBUG TikTok] Failed to parse JSON-LD #' + jsonLdCount + ':', e);
        continue;
      }
    }
    
    console.log('[DEBUG TikTok] Total JSON-LD scripts found:', jsonLdCount);
    console.log('[DEBUG TikTok] No useful JSON-LD found, trying meta tags');

    // Fallback to meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)">/);
    const title = titleMatch ? titleMatch[1] : 'TikTok Recipe';

    // Try multiple patterns for description
    let description = '';
    const descMatch = html.match(/<meta property="og:description" content="([^"]*)">/);
    if (descMatch) {
      description = descMatch[1];
    }
    
    // Try twitter:description
    if (!description) {
      const twitterDescMatch = html.match(/<meta name="twitter:description" content="([^"]*)">/);
      if (twitterDescMatch) {
        description = twitterDescMatch[1];
      }
    }
    
    // Try description meta tag
    if (!description) {
      const metaDescMatch = html.match(/<meta name="description" content="([^"]*)">/);
      if (metaDescMatch) {
        description = metaDescMatch[1];
      }
    }

    // Extract thumbnail
    const thumbnailMatch = html.match(/<meta property="og:image" content="([^"]*)">/);
    const thumbnail = thumbnailMatch ? thumbnailMatch[1] : '';

    console.log('[DEBUG TikTok] Extracted from meta tags:', {
      titleLength: title.length,
      descriptionLength: description.length,
      descriptionPreview: description.substring(0, 100) + '...',
      hasThumbnail: !!thumbnail
    });

    if (!title && !description) {
      throw new Error('Could not extract TikTok video information - TikTok may be blocking scraping attempts');
    }

    return {
      title,
      description,
      thumbnail,
    };
  } catch (error) {
    console.error('[ERROR TikTok] Full error:', error);
    throw new Error('Failed to fetch TikTok video information');
  }
}

export function isTikTokUrl(url: string): boolean {
  return /tiktok\.com/.test(url);
}
