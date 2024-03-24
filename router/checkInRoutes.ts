import express from "express";
import { isLoggedIn } from "../utils/guard";
import { multerUpload } from "../utils/multer";
import CheckInService from "../services/checkInService";
import CheckInController from "../controllers/checkInController";
import { knex } from "../utils/db";
const checkInRoutes = express.Router();

const checkInService = new CheckInService(knex);
const checkInController = new CheckInController(checkInService);

checkInRoutes.post("/check-in", isLoggedIn, checkInController.addCheckInRecord);
checkInRoutes.patch(
  "/check-in",
  isLoggedIn,
  multerUpload,
  checkInController.updateCheckInData
);
checkInRoutes.get(
  "/check-in/record",
  isLoggedIn,
  checkInController.getCheckInRecordByUser
);
checkInRoutes.get("/check-in/status", isLoggedIn, checkInController.isCheckIn);
checkInRoutes.get(
  "/check-in/game",
  isLoggedIn,
  checkInController.getGameAllCheckInRecord
);
export default checkInRoutes;
