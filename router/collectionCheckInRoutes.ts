import express from "express";
import { isLoggedIn } from "../utils/guard";
import { multerUpload } from "../utils/multer";
import CollectionCheckInService from "../services/collectionCheckInService";
import CollectionCheckInController from "../controllers/collectionCheckInController";
import { knex } from "../utils/db";
const collectionCheckInRoutes = express.Router();

const collectionCheckInService = new CollectionCheckInService(knex);
const collectionCheckInController = new CollectionCheckInController(
  collectionCheckInService
);

collectionCheckInRoutes.get(
  "/collection",
  isLoggedIn,
  collectionCheckInController.getCollectionByUser
);

collectionCheckInRoutes.post(
  "/collection",
  isLoggedIn,
  collectionCheckInController.addOrInactiveCollection
);
collectionCheckInRoutes.post(
  "/check-in",
  isLoggedIn,
  collectionCheckInController.addCheckInRecord
);
collectionCheckInRoutes.patch(
  "/check-in",
  isLoggedIn,
  multerUpload,
  collectionCheckInController.updateCheckInData
);
collectionCheckInRoutes.get(
  "/check-in/record",
  isLoggedIn,
  collectionCheckInController.getCheckInRecordByUser
);
collectionCheckInRoutes.get(
  "/check-in/game",
  isLoggedIn,
  collectionCheckInController.checkOldCheckInRecordByGame
);

export default collectionCheckInRoutes;
