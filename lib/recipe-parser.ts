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
      
      // Debug logging for YouTube
      console.log('[DEBUG Recipe Parser - YouTube]', {
        sourceType,
        contentLength: content.length,
        descriptionLength: videoInfo.description.length,
        titleLength: rawTitle.length,
        contentPreview: content.substring(0, 300) + '...'
      });
      
      // Validate sufficient content
      if (videoInfo.description.length < 100) {
        throw new Error(`INSUFFICIENT_CONTENT: YouTube video description is too short (${videoInfo.description.length} characters). The video may not contain a full recipe in the description. Please try a video with a complete recipe in the description, or use a website link instead.`);
      }
      
      // Check for common "no recipe" phrases
      const lowerDesc = videoInfo.description.toLowerCase();
      if (lowerDesc.includes('recipe in bio') || 
          lowerDesc.includes('link in bio') || 
          lowerDesc.includes('full recipe in comments') ||
          lowerDesc.includes('recipe link below')) {
        throw new Error('INSUFFICIENT_CONTENT: The video description says the recipe is in the bio, comments, or a link. Please use that link instead.');
      }
      
      break;
    }
    case 'tiktok': {
      const videoInfo = await fetchTikTokInfo(url);
      content = `Title: ${videoInfo.title}\n\nCaption:\n${videoInfo.description}`;
      imageUrl = videoInfo.thumbnail;
      rawTitle = videoInfo.title;
      
      // Debug logging for TikTok
      console.log('[DEBUG Recipe Parser - TikTok]', {
        sourceType,
        contentLength: content.length,
        descriptionLength: videoInfo.description.length,
        titleLength: rawTitle.length,
        contentPreview: content.substring(0, 300) + '...'
      });
      
      // Validate sufficient content
      if (videoInfo.description.length < 80) {
        throw new Error(`INSUFFICIENT_CONTENT: TikTok caption is too short (${videoInfo.description.length} characters). TikTok recipes often have the full recipe on a linked website. Please use the website link from the video bio instead.`);
      }
      
      // Check for common "no recipe" phrases
      const lowerDesc = videoInfo.description.toLowerCase();
      if (lowerDesc.includes('recipe in bio') || 
          lowerDesc.includes('link in bio') ||
          lowerDesc.includes('full recipe') ||
          lowerDesc.includes('recipe below')) {
        throw new Error('INSUFFICIENT_CONTENT: The TikTok caption indicates the recipe is in the bio or a link. Please use that link instead.');
      }
      
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
  const extractedRecipe = await extractRecipeWithAI(content, sourceType);

  // Use extracted title if available, otherwise use raw title
  const finalTitle = extractedRecipe.title || rawTitle;

  // Use placeholder if no image found
  if (!imageUrl || imageUrl === '') {
    console.log('No image found from source, using placeholder');
    imageUrl = '/placeholder-recipe.svg';
  }

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
    let image: any = '';
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
        
        // Handle both array and single string cases
        const ingredients = Array.isArray(recipeData.recipeIngredient) 
          ? recipeData.recipeIngredient 
          : [recipeData.recipeIngredient];
        
        ingredients.forEach((ing: string) => {
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

    // Normalize image to string (handle arrays and objects)
    console.log('Raw image value:', typeof image, image);
    
    if (Array.isArray(image)) {
      console.log('Image is array, taking last element');
      image = image?.[image.length - 1] || '';
    } else if (typeof image === 'object' && image !== null) {
      // Handle structured data objects
      console.log('Image is object, extracting URL');
      image = (image as any).url || (image as any).contentUrl || '';
    }
    
    // Ensure image is a string
    image = String(image || '');
    console.log('Normalized image:', image);

    // Ensure absolute URL for image
    if (image && typeof image === 'string' && !image.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        image = new URL(image, urlObj.origin).href;
      } catch (e) {
        console.error('Error creating absolute URL for image:', e);
        image = '';
      }
    }

    // Use placeholder if no image found
    if (!image || image === '') {
      console.log('No image found on website, using placeholder');
      image = '/placeholder-recipe.svg';
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
