import express, { Request, Response } from "express";
import { logger } from "../utils/logger";

const midRoutes = express.Router();

midRoutes.get("/404", pageNotFound);

//404
function pageNotFound(req: Request, res: Response) {
  logger.warn("錯link :", req.path);
  res.redirect("/404.html");
}

export default midRoutes;
