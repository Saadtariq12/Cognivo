import { supabase } from "../../config/database.js";

export const registerUser = async ({ fullName, email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "recruiter",
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user || data.user.identities?.length === 0) {
    throw new Error("Registration failed");
  }

  return data;
};

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

// Supabase sessions are held by the client, so logout does not need a server-side session.
export const logoutUser = async () => undefined;
