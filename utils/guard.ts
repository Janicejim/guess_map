import { Request, Response, NextFunction } from "express";
export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session["user"]) {
    next();
  } else {
    res.redirect("/login.html")
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
    res.redirect("/login.html")
  }
};
