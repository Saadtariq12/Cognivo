import { supabase } from "../config/database.js";

const createInvitation = async ({
  interviewId,
  candidateId,
  recruiterId,
  tokenHash,
  expiresAt,
}) => {
  const { data, error } = await supabase
    .from("interview_invitations")
    .insert({
      interview_id: interviewId,
      candidate_id: candidateId,
      recruiter_id: recruiterId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .select("id, expires_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const findInvitationByTokenHash = async (tokenHash) => {
  const { data, error } = await supabase
    .from("interview_invitations")
    .select("id, interview_id, candidate_id, status, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const deleteInvitation = async (invitationId) => {
  const { error } = await supabase
    .from("interview_invitations")
    .delete()
    .eq("id", invitationId);

  if (error) {
    throw error;
  }
};

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

export {
  createInvitation,
  deleteInvitation,
  findInvitationByTokenHash,
  update_status,
};
