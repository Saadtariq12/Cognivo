import { supabase } from "../config/database.js";
const job_requirements = async(id) => {
    const {data,error} = await supabase
    .from('interviews')
    .select('title, description, required_skills')
    .eq('id',id)
    if(error){
        throw error
    }
    return data
} 

export {job_requirements}