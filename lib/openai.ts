import OpenAI from 'openai';
import { Ingredient, Instruction } from './supabase/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedRecipe {
  title: string;
  description: string;
  servings: number;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
}

export async function extractRecipeWithAI(content: string, sourceType?: string): Promise<ExtractedRecipe> {
  // Validate content length
  if (!content || content.trim().length < 50) {
    throw new Error('INSUFFICIENT_CONTENT: Not enough content to extract a recipe.');
  }
  
  // Build context-aware prompt based on source type
  let sourceContext = '';
  if (sourceType === 'youtube') {
    sourceContext = `IMPORTANT: This content is from a YouTube video description.
- Extract ONLY the recipe information that is clearly present in the description
- If ingredients are listed, extract them exactly as written
- If amounts are mentioned, use those amounts
- If amounts are vague (e.g., "some salt"), estimate reasonable amounts based on servings
- DO NOT invent or hallucinate ingredients that aren't mentioned
- DO NOT make up steps that aren't described`;
  } else if (sourceType === 'tiktok') {
    sourceContext = `IMPORTANT: This content is from a TikTok video caption.
- Extract ONLY the recipe information that is clearly present in the caption
- If ingredients are listed, extract them exactly as written
- If amounts are mentioned, use those amounts
- If amounts are vague, estimate reasonable amounts based on servings
- DO NOT invent or hallucinate ingredients that aren't mentioned
- DO NOT make up steps that aren't described`;
  } else {
    sourceContext = `This content is from a website. Extract the complete recipe information.`;
  }

  const prompt = `Extract recipe information from the following content.

${sourceContext}

Rules:
- Extract all text IN GERMAN (Standard German / Hochdeutsch)
- Use metric units (g, ml, EL, TL, Prise, etc.)
- Number instructions sequentially starting from 1
- Estimate difficulty based on steps and complexity
- Include relevant tags in German (vegetarisch, vegan, glutenfrei, schnell, etc.)
- Estimate times if not explicitly stated

Content:
${content}`;

  console.log('[DEBUG OpenAI]', {
    sourceType: sourceType || 'website',
    contentLength: content.length,
    promptLength: prompt.length,
    contentPreview: content.substring(0, 300) + '...'
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a recipe extraction expert. Extract all recipe content in German (Standard German / Hochdeutsch).'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'recipe_extraction',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Recipe title in German'
              },
              description: {
                type: 'string',
                description: 'Brief description (2-3 sentences) in German'
              },
              servings: {
                type: 'number',
                description: 'Number of servings'
              },
              prep_time: {
                type: ['number', 'null'],
                description: 'Preparation time in minutes, or null if not specified'
              },
              cook_time: {
                type: ['number', 'null'],
                description: 'Cooking time in minutes, or null if not specified'
              },
              total_time: {
                type: ['number', 'null'],
                description: 'Total time in minutes, or null if not specified'
              },
              difficulty: {
                type: 'string',
                enum: ['easy', 'medium', 'hard'],
                description: 'Recipe difficulty level'
              },
              ingredients: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Ingredient name in German'
                    },
                    amount: {
                      type: 'number',
                      description: 'Quantity of ingredient'
                    },
                    unit: {
                      type: 'string',
                      description: 'Unit of measurement (g, ml, EL, TL, Prise, Stück, etc.)'
                    },
                    notes: {
                      type: 'string',
                      description: 'Optional preparation notes in German (e.g., gehackt, gewürfelt)'
                    }
                  },
                  required: ['name', 'amount', 'unit', 'notes'],
                  additionalProperties: false
                },
                description: 'List of ingredients'
              },
              instructions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    step_number: {
                      type: 'number',
                      description: 'Step number starting from 1'
                    },
                    description: {
                      type: 'string',
                      description: 'Detailed instruction in German'
                    },
                    duration: {
                      type: ['number', 'null'],
                      description: 'Duration for this step in minutes, or null'
                    }
                  },
                  required: ['step_number', 'description', 'duration'],
                  additionalProperties: false
                },
                description: 'Step-by-step cooking instructions'
              },
              tags: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Recipe tags in German (vegetarisch, vegan, glutenfrei, schnell, etc.)'
              }
            },
            required: ['title', 'description', 'servings', 'prep_time', 'cook_time', 'total_time', 'difficulty', 'ingredients', 'instructions', 'tags'],
            additionalProperties: false
          }
        }
      },
      temperature: 0.3,
      max_tokens: 5000,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON directly (response_format ensures valid JSON)
    const recipe = JSON.parse(responseText) as ExtractedRecipe;
    
    // Validate required fields
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error('Missing required recipe fields');
    }

    return recipe;
  } catch (error) {
    console.error('Error extracting recipe with AI:', error);
    throw new Error('Failed to extract recipe information');
  }
}
