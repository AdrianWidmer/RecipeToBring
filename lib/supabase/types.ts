export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          created_by: string
          title: string
          description: string | null
          image_url: string
          source_url: string
          source_type: 'website' | 'youtube' | 'tiktok'
          servings: number
          prep_time: number | null
          cook_time: number | null
          total_time: number | null
          difficulty: 'easy' | 'medium' | 'hard' | null
          ingredients: Json
          instructions: Json
          tags: string[] | null
          is_public: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by: string
          title: string
          description?: string | null
          image_url: string
          source_url: string
          source_type: 'website' | 'youtube' | 'tiktok'
          servings?: number
          prep_time?: number | null
          cook_time?: number | null
          total_time?: number | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          ingredients: Json
          instructions: Json
          tags?: string[] | null
          is_public?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string
          title?: string
          description?: string | null
          image_url?: string
          source_url?: string
          source_type?: 'website' | 'youtube' | 'tiktok'
          servings?: number
          prep_time?: number | null
          cook_time?: number | null
          total_time?: number | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          ingredients?: Json
          instructions?: Json
          tags?: string[] | null
          is_public?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      recipe_extractions: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Ingredient = {
  name: string
  amount: number
  unit: string
  notes?: string
}

export type Instruction = {
  step_number: number
  description: string
  duration?: number
}

export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update']
