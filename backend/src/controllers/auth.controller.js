import {
  registerUser,
  loginUser,
  logoutUser,
} from "../services/AuthServices/authService.js";

const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Full name, email, and password are required",
    });
  }

  try {
    const data = await registerUser({ fullName, email, password });
    const user = data.user
      ? { id: data.user.id, email: data.user.email, role: "recruiter" }
      : null;

    return res.status(201).json({
      success: true,
      message: "Recruiter registered successfully",
      data: { user, session: data.session },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to register with those details",
      data: error
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const data = await loginUser({ email, password });
    const user = data.user
      ? { id: data.user.id, email: data.user.email, role: "recruiter" }
      : null;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, session: data.session },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
};

const logout = async (req, res) => {
  await logoutUser();
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export { register, login, logout };
