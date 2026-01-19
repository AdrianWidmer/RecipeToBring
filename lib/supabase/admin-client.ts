import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client with service role privileges.
 * This client can access admin APIs like auth.admin.listUsers()
 * 
 * ⚠️ WARNING: Only use this in API routes (server-side).
 * Never expose the service role key to the client!
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or service role key');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
