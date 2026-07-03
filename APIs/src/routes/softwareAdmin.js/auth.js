import express from "express";
import requiredFieldsMiddleware from "../../middlewares/requiredFieldsMiddleware.js";
import { SetPasswordSchema, SignInSchema } from "../../constants/schemas.js";
import { Current, SetPassword, SignIn, TwoFactorAuthentication } from "../../controllers/softwareAdmin/auth/index.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/signin", requiredFieldsMiddleware(SignInSchema), SignIn);
router.get("/current", authMiddleware, Current);
router.post("/set-password", authMiddleware, requiredFieldsMiddleware(SetPasswordSchema), SetPassword);
// Retained but unused while the authenticator-app flow is disabled.
router.post("/verify-otp", authMiddleware, TwoFactorAuthentication);

export default router;
