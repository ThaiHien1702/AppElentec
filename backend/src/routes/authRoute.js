import express from "express";
import { signUp, signIn, signOut } from "../controllers/authController.js";
import {
  assignRole,
  removeRole,
  getAllUsers,
  getUsersByRole,
  getUserById,
  updateUserProfileByAdmin,
  deleteUser,
} from "../controllers/adminController.js";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/profileController.js";
import {
  verifyToken,
  isModerator,
  isAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

//Public routes
router.post("/signup", signUp);
router.post("/signin", signIn);

//Protected routes
router.post("/signout", verifyToken, signOut);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.post("/change-password", verifyToken, changePassword);

//Moderator routes (moderator, admin)
router.get("/moderator/users", verifyToken, isModerator, getAllUsers);
router.get("/moderator/users/:userId", verifyToken, isModerator, getUserById);
router.get(
  "/moderator/users/role/:role",
  verifyToken,
  isModerator,
  getUsersByRole,
);

//Admin routes (admin)
router.post("/admin/assign-role", verifyToken, isAdmin, assignRole);
router.post("/admin/remove-role", verifyToken, isAdmin, removeRole);
router.post("/admin/create-user", verifyToken, isAdmin, signUp);
router.delete("/admin/delete-user", verifyToken, isAdmin, deleteUser);
router.get("/admin/all-users", verifyToken, isAdmin, getAllUsers);
router.get("/admin/users/:userId", verifyToken, isAdmin, getUserById);
router.put(
  "/admin/users/:userId",
  verifyToken,
  isAdmin,
  updateUserProfileByAdmin,
);
router.get("/admin/users/role/:role", verifyToken, isAdmin, getUsersByRole);

export default router;
