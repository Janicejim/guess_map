import express from "express";
import { knex } from "../utils/db";
import AwardController from "../controllers/awardController";
import AwardService from "../services/awardService";
import { isAdmin, isLoggedIn } from "../utils/guard";
import { multerUpload } from "../utils/multer";


const awardRoutes = express.Router();
const awardService = new AwardService(knex);
const awardController = new AwardController(awardService);

awardRoutes.get("/award", awardController.getAward);
awardRoutes.post("/award", isAdmin, multerUpload, awardController.createAward);
awardRoutes.put("/award", isAdmin, multerUpload, awardController.editAward);
awardRoutes.delete("/award", isAdmin, awardController.inactiveAward);
awardRoutes.get("/award/record", isLoggedIn, awardController.getAwardRecord);
awardRoutes.post(
  "/award/record",
  isLoggedIn,
  awardController.createAwardRecord
);
export default awardRoutes;
