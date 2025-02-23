import express from "express";
import { knex } from "../utils/db";
import AwardController from "../controllers/awardController";
import AwardService from "../services/awardService";
import { isAdmin, isLoggedIn } from "../utils/guard";


const awardRoutes = express.Router();
const awardService = new AwardService(knex);
const awardController = new AwardController(awardService);

awardRoutes.get("/award", awardController.getAward);
awardRoutes.post("/award", isAdmin, awardController.createAward);
awardRoutes.put("/award", isAdmin, awardController.editAward);
awardRoutes.delete("/award", isAdmin, awardController.inactiveAward);
awardRoutes.get("/award/record", isLoggedIn, awardController.getAwardRecord);
awardRoutes.post(
  "/award/record",
  isLoggedIn,
  awardController.createAwardRecord
);
export default awardRoutes;
