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

export async function extractRecipeWithAI(content: string): Promise<ExtractedRecipe> {
  const prompt = `Extract recipe information from the following content and return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):

{
  "title": "string",
  "description": "string (2-3 sentences)",
  "servings": number,
  "prep_time": number (in minutes, or null),
  "cook_time": number (in minutes, or null),
  "total_time": number (in minutes, or null),
  "difficulty": "easy" | "medium" | "hard",
  "ingredients": [
    {
      "name": "string",
      "amount": number,
      "unit": "string (g, ml, EL, TL, etc.)",
      "notes": "string (optional)"
    }
  ],
  "instructions": [
    {
      "step_number": number (starting from 1),
      "description": "string",
      "duration": number (minutes if specified, otherwise null)
    }
  ],
  "tags": ["string"]
}

Rules:
- Extract all text IN GERMAN (Standard German / Hochdeutsch)
- Use metric units (g, ml, EL, TL, Prise, etc.)
- Number instructions sequentially starting from 1
- Estimate difficulty based on steps and complexity
- Include relevant tags in German (vegetarisch, vegan, glutenfrei, schnell, etc.)
- Estimate times if not explicitly stated
- Return ONLY the JSON object, nothing else - no explanations, no markdown

Content:
${content}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a recipe extraction expert. Always return valid JSON only, no markdown formatting. Extract all recipe content in German (Standard German / Hochdeutsch).'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Remove markdown code blocks if present
    const jsonText = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim();

    const recipe = JSON.parse(jsonText) as ExtractedRecipe;
    
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
