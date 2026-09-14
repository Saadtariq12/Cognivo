import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
);

const checkSupabaseConnection = async () => {
  const { error } = await supabase.from("profiles").select("id").limit(1);

  if (error) {
    console.error("❌ Supabase connection failed:", error.message);
    return;
  }

  console.log("✅ Supabase connected successfully");
};

export { supabase, checkSupabaseConnection };
