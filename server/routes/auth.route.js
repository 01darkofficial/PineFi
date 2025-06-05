import express from "express"
import { registerUser, loginUser, getMe, updateNetWorth, deleteUser } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/networth", protect, updateNetWorth);
router.delete("/delete", protect, deleteUser);
router.get("/me", protect, getMe);

export default router;
