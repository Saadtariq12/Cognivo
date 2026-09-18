import { supabase } from "../config/database.js";

const update_status = async (session_id) => {
  const { data, error } = await supabase
    .from("interview_sessions")
    .update({ status: "completed" })
    .eq("session_id", session_id)
    .select();

  if (error) {
    throw error;
  }
};

export { update_status };
