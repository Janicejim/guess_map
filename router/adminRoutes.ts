import express from "express";
import { knex } from "../utils/db";
import AdminController from "../controllers/adminController";
import AdminService from "../services/adminService";
import { isAdmin } from "../utils/guard";

const adminRoutes = express.Router();
const adminService = new AdminService(knex);
const adminController = new AdminController(adminService);

adminRoutes.post("/search/game", isAdmin, adminController.searchGame);
adminRoutes.post("/search/user", isAdmin, adminController.searchUser);
adminRoutes.delete("/game", isAdmin, adminController.deleteGame);
adminRoutes.put("/user", isAdmin, adminController.SwitchGradeUser);

export default adminRoutes;
