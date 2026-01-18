import * as cheerio from 'cheerio';
import { fetchYouTubeInfo } from './youtube';
import { fetchTikTokInfo, isTikTokUrl } from './tiktok';
import { extractRecipeWithAI, ExtractedRecipe } from './openai';

export type SourceType = 'website' | 'youtube' | 'tiktok';

export interface ParsedRecipe extends ExtractedRecipe {
  source_url: string;
  source_type: SourceType;
  image_url: string;
}

export async function parseRecipeFromUrl(url: string): Promise<ParsedRecipe> {
  const sourceType = detectSourceType(url);
  
  let content: string;
  let imageUrl: string;
  let rawTitle: string = '';

  switch (sourceType) {
    case 'youtube': {
      const videoInfo = await fetchYouTubeInfo(url);
      content = `Title: ${videoInfo.title}\n\nDescription:\n${videoInfo.description}`;
      imageUrl = videoInfo.thumbnail;
      rawTitle = videoInfo.title;
      break;
    }
    case 'tiktok': {
      const videoInfo = await fetchTikTokInfo(url);
      content = `Title: ${videoInfo.title}\n\nCaption:\n${videoInfo.description}`;
      imageUrl = videoInfo.thumbnail;
      rawTitle = videoInfo.title;
      break;
    }
    case 'website': {
      const websiteData = await scrapeWebsite(url);
      content = websiteData.content;
      imageUrl = websiteData.image;
      rawTitle = websiteData.title;
      break;
    }
  }

  // Extract recipe using AI
  const extractedRecipe = await extractRecipeWithAI(content);

  // Use extracted title if available, otherwise use raw title
  const finalTitle = extractedRecipe.title || rawTitle;

  return {
    ...extractedRecipe,
    title: finalTitle,
    source_url: url,
    source_type: sourceType,
    image_url: imageUrl,
  };
}

function detectSourceType(url: string): SourceType {
  if (/youtube\.com|youtu\.be/.test(url)) {
    return 'youtube';
  }
  if (isTikTokUrl(url)) {
    return 'tiktok';
  }
  return 'website';
}

async function scrapeWebsite(url: string): Promise<{ content: string; image: string; title: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try to extract schema.org Recipe structured data
    const jsonLdScripts = $('script[type="application/ld+json"]');
    let recipeData: any = null;

    jsonLdScripts.each((_, element) => {
      try {
        const json = JSON.parse($(element).html() || '');
        if (json['@type'] === 'Recipe' || (Array.isArray(json['@graph']) && json['@graph'].find((item: any) => item['@type'] === 'Recipe'))) {
          recipeData = json['@type'] === 'Recipe' ? json : json['@graph'].find((item: any) => item['@type'] === 'Recipe');
        }
      } catch (e) {
        // Continue to next script
      }
    });

    let content = '';
    let image = '';
    let title = '';

    if (recipeData) {
      // Use structured data
      title = recipeData.name || '';
      content = `Recipe: ${recipeData.name}\n\n`;
      
      if (recipeData.description) {
        content += `Description: ${recipeData.description}\n\n`;
      }

      if (recipeData.recipeIngredient) {
        content += 'Ingredients:\n';
        recipeData.recipeIngredient.forEach((ing: string) => {
          content += `- ${ing}\n`;
        });
        content += '\n';
      }

      if (recipeData.recipeInstructions) {
        content += 'Instructions:\n';
        if (Array.isArray(recipeData.recipeInstructions)) {
          recipeData.recipeInstructions.forEach((instruction: any, index: number) => {
            const text = typeof instruction === 'string' ? instruction : instruction.text;
            content += `${index + 1}. ${text}\n`;
          });
        } else if (typeof recipeData.recipeInstructions === 'string') {
          content += recipeData.recipeInstructions;
        }
      }

      image = recipeData.image?.url || recipeData.image || '';
    } else {
      // Fallback to scraping visible content
      title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Recipe';
      
      // Get main content
      const mainContent = $('main, article, .recipe, [itemtype*="Recipe"]').first();
      
      if (mainContent.length) {
        content = mainContent.text().trim();
      } else {
        content = $('body').text().trim();
      }

      // Clean up content
      content = content.replace(/\s+/g, ' ').trim();

      // Get image
      image = $('meta[property="og:image"]').attr('content') || 
              $('[itemtype*="Recipe"] img').first().attr('src') || 
              $('article img').first().attr('src') || '';
    }

    // Ensure absolute URL for image
    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url);
      image = new URL(image, urlObj.origin).href;
    }

    if (!content) {
      throw new Error('Could not extract recipe content from website');
    }

    return { content, image, title };
  } catch (error) {
    console.error('Error scraping website:', error);
    throw new Error('Failed to scrape recipe from website');
  }
}
