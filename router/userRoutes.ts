import express from "express";
import { knex } from "../utils/db";

import { multerUpload } from "../utils/multer";
import { isLoggedIn } from "../utils/guard";
import UserService from "../services/userService";
import UserController from "../controllers/userController";

// import { format } from "date-fns";

const userRoutes = express.Router();

const userService = new UserService(knex);
const userController = new UserController(userService);

// ^^^^^^^^^^^^^^^^^^ for user upload profile ^^^^^^^^^^^^^^^^^^^^//
userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);
userRoutes.get("/login/google", userController.loginGoogle);
userRoutes.post("/logout", isLoggedIn, userController.logout);
userRoutes.get("/user", userController.getUserInfo);
userRoutes.put(
  "/profile",
  isLoggedIn,
  multerUpload,
  userController.editProfile
);
userRoutes.get("/login/status", userController.isLogin);
export default userRoutes;
