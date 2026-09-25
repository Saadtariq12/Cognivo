import {
  createAuthenticatedSupabaseClient,
  supabase,
} from "../config/database.js";

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token, ...extraParts] = authorizationHeader
    .trim()
    .split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token || extraParts.length > 0) {
    return null;
  }

  return token;
};

const authenticateUser = async (req, res, next) => {
  const accessToken = getBearerToken(req.get("authorization"));

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required",
    });
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    const authenticatedSupabase =
      createAuthenticatedSupabaseClient(accessToken);
    const { data: profile, error: profileError } = await authenticatedSupabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({
        success: false,
        message: "Unable to verify user access",
      });
    }

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: "A recruiter profile is required",
      });
    }

    req.user = {
      id: user.id,
      email: profile.email || user.email,
      role: profile.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unable to authenticate request",
    });
  }
};

const requireRecruiter = (req, res, next) => {
  if (req.user?.role !== "recruiter") {
    return res.status(403).json({
      success: false,
      message: "Recruiter access is required",
    });
  }

  return next();
};

export { authenticateUser, getBearerToken, requireRecruiter };
