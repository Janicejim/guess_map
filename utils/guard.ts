import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";
export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session["user"]) {
    next();
  } else {
    logger.info("Login first");
    res.redirect("/login.html");
  }
};
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.session &&
    req.session["user"] &&
    req.session["user"].role === "admin"
  ) {
    next();
  } else {
    logger.info("no Permission");
    res.redirect("/login.html");
  }
};
