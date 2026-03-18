import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use real Supabase client when env vars are configured
// Falls back to mock data layer for local dev without Supabase
const isConfigured =
  supabaseUrl &&
  supabaseUrl !== "http://localhost:54321" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your-anon-key-here";

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);

export const usesMockData = !isConfigured;
