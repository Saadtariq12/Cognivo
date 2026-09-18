import { supabase } from "../config/database.js";

const fetchCandidateInfo = async(candidate_id) => {
    const {data, error} = await supabase
    .from('candidates')
    .select('introduction, projects, skills')
    .eq('profile_id', candidate_id)
    .maybeSingle()  // Returns: { introduction: "...", projects: [...], skills: [...] } instead of [{ introduction: "...", projects: [...], skills: [...] }]
    if(error){
        throw error
    }
    return data || { introduction: null, projects: [], skills: [] };
};

const storeCandidateInfo = async(candidate_id, introduction, projects, skills) => {
    const {data, error} = await supabase
    .from('candidates')
    .update({
        introduction: introduction,
        projects: projects,
        initial_claimed_skills: skills
    })
    .eq('profile_id', candidate_id)

    if(error){
        throw error
    }
}

export { fetchCandidateInfo, storeCandidateInfo }
