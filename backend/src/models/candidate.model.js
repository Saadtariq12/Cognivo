import e from "express";
import { supabase } from "../config/database.js";

const findCandidateByEmail = async (email) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const findCandidateById = async (candidateId) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("id, email")
    .eq("id", candidateId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const createCandidate = async (email) => {
  const { data, error } = await supabase
    .from("candidates")
    .insert({ email })
    .select("id, email")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const deleteCandidate = async (candidateId) => {
  const { error } = await supabase
    .from("candidates")
    .delete()
    .eq("id", candidateId);

  if (error) {
    throw error;
  }
};

const fetchCandidateInfo = async (candidate_id) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("introduction, projects, initial_claimed_skills")
    .eq("profile_id", candidate_id)
    .maybeSingle(); // Returns: { introduction: "...", projects: [...], skills: [...] } instead of [{ introduction: "...", projects: [...], skills: [...] }]
  if (error) {
    throw error;
  }
  return (
    data || { introduction: null, projects: [], initial_claimed_skills: [] }
  );
};

const storeCandidateInfo = async (
  candidate_id,
  introduction,
  projects,
  skills,
) => {
  const { data, error } = await supabase
    .from("candidates")
    .update({
      introduction: introduction,
      projects: projects,
      initial_claimed_skills: skills,
    })
    .eq("profile_id", candidate_id);

  if (error) {
    throw error;
  }
};
const intro_exists = async (candidate_id) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("introduction")
    .eq("id", candidate_id)
    .single();

  if (error) {
    throw error;
  }
  return data && data.introduction ? true : false;
};
export {
  createCandidate,
  deleteCandidate,
  fetchCandidateInfo,
  findCandidateByEmail,
  findCandidateById,
  intro_exists,
  storeCandidateInfo,
};
