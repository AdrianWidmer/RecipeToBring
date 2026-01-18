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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = await response.text();

    // Try to extract from JSON-LD first (most complete data)
    const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    
    for (const match of jsonLdMatches) {
      try {
        const jsonData = JSON.parse(match[1]);
        console.log('[DEBUG TikTok] Found JSON-LD, type:', jsonData['@type']);
        
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
        console.log('[DEBUG TikTok] Failed to parse JSON-LD:', e);
        continue;
      }
    }
    
    console.log('[DEBUG TikTok] No useful JSON-LD found, trying meta tags');

    // Fallback to meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)">/);
    const title = titleMatch ? titleMatch[1] : 'TikTok Recipe';

    // Extract description
    const descMatch = html.match(/<meta property="og:description" content="([^"]*)">/);
    const description = descMatch ? descMatch[1] : '';

    // Extract thumbnail
    const thumbnailMatch = html.match(/<meta property="og:image" content="([^"]*)">/);
    const thumbnail = thumbnailMatch ? thumbnailMatch[1] : '';

    console.log('[DEBUG TikTok] Extracted from meta tags:', {
      titleLength: title.length,
      descriptionLength: description.length,
      descriptionPreview: description.substring(0, 100) + '...'
    });

    if (!title && !description) {
      throw new Error('Could not extract TikTok video information');
    }

    return {
      title,
      description,
      thumbnail,
    };
  } catch (error) {
    console.error('Error fetching TikTok info:', error);
    throw new Error('Failed to fetch TikTok video information');
  }
}

export function isTikTokUrl(url: string): boolean {
  return /tiktok\.com/.test(url);
}
