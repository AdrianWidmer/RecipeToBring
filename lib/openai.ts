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
  const prompt = `Extract recipe information from the following content and return ONLY valid JSON with this exact structure (no markdown, no code blocks, just JSON):
{
  "title": "string",
  "description": "string (2-3 sentences summarizing the recipe)",
  "servings": number,
  "prep_time": number (in minutes, can be null),
  "cook_time": number (in minutes, can be null),
  "total_time": number (in minutes, can be null),
  "difficulty": "easy" | "medium" | "hard",
  "ingredients": [
    {
      "name": "string (ingredient name)",
      "amount": number,
      "unit": "string (cups, tbsp, g, oz, etc.)",
      "notes": "string (optional, like 'chopped', 'diced')"
    }
  ],
  "instructions": [
    {
      "step_number": number (starting from 1),
      "description": "string (clear instruction)",
      "duration": number (minutes if specified, otherwise null)
    }
  ],
  "tags": ["string"] (e.g., ["vegetarian", "quick", "dinner", "italian"])
}

Rules:
- Extract all ingredients with proper amounts and units
- Number instructions sequentially
- Estimate difficulty based on number of steps and complexity
- Include relevant dietary tags (vegetarian, vegan, gluten-free, etc.)
- Estimate times if not explicitly stated
- Return ONLY the JSON object, nothing else

Content:
${content}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a recipe extraction expert. Always return valid JSON only, no markdown formatting.'
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
