import "server-only";
import { createClient } from "@/utils/supabase/server";

export async function getNeeds() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("needs")
    .select("id, key, label, color, description, sort_order")
    .order("sort_order");

  if (error) throw error;
  return data;
}
