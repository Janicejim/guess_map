import express from "express";
import { knex } from "../utils/db";
import AdminController from "../controllers/adminController";
import AdminService from "../services/adminService";

const adminRoutes = express.Router();
const adminService = new AdminService(knex);
const adminController = new AdminController(adminService);

adminRoutes.post("/search/game", adminController.searchGame);
adminRoutes.post("/search/user", adminController.searchUser);
adminRoutes.delete("/game", adminController.deleteGame);
adminRoutes.put("/user", adminController.SwitchGradeUser);

export default adminRoutes;
