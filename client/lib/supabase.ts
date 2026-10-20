import { createClient } from "@supabase/supabase-js";
import type { Database } from "@shared/database.types";

/**
 * The app's single connection to Supabase. Its keys are public (see .env):
 * the database's row-level security decides what each neighbor can see.
 */
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
