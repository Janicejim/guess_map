import { Request, Response, NextFunction } from "express";
export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session["user"]) {
    next();
  } else {
    // console.log("user haven't login");
    res.json("login first");
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
    // console.log("no admin Permission");
    res.json("admin only");
  }
};
