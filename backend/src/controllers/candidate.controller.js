import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyCandidateInvitation } from "../services/Invitation/verifyInvitation.service.js";

const verifyInvitation = asyncHandler(async (req, res) => {
  try {
    const data = await verifyCandidateInvitation(req.body);

    return res.status(200).json({
      success: true,
      message: "Invitation verified successfully",
      data,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
      console.error("Failed to verify candidate invitation:", error.message);
    }

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Invitation could not be verified"
          : error.message,
    });
  }
});

export { verifyInvitation };
