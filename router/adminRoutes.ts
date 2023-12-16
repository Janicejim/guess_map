import express, { Request, Response } from "express";
import { knex } from "../utils/db";
import { logger } from "../utils/logger";
import { io } from "./SocketRoute";

const adminRoutes = express.Router();

adminRoutes.post("/search/game", searchGame);
adminRoutes.delete("/game", deleteGame);

adminRoutes.post("/search/user", searchUser);
adminRoutes.put("/user", SwitchGradeUser);

async function searchGame(req: Request, res: Response) {
  const { searchText } = req.body;
  const gameInfo = await knex.raw(
    `select name,profile_image,game.media,game.created_at,game.id from users inner join game on users.id= game.user_id where email LIKE ? OR name LIKE ?`,
    [`%${searchText}%`, `%${searchText}%`]
  );
  return res.json(gameInfo.rows);
}

async function deleteGame(req: Request, res: Response) {
  try {
    const allGameIDArray = req.body;
    for (let i = 0; i < allGameIDArray.length; i++) {
      await knex("game")
        .update({ status: "inactive" })
        .where("id", allGameIDArray[i]);

      io.emit("updateGame");
    }
    return res.json({ success: true, msg: "delete Games success" });
  } catch (error) {
    logger.error("Error :", error);
    return res.json({ success: false, msg: error });
  }
}

async function searchUser(req: Request, res: Response) {
  const { searchText } = req.body;
  const userInfo = await knex.raw(
    `select name,email,profile_image,role from users where email LIKE ? OR name LIKE ? order by role asc`,
    [`%${searchText}%`, `%${searchText}%`]
  );

  return res.json(userInfo.rows);
}

async function SwitchGradeUser(req: Request, res: Response) {
  try {
    const allEmailArray = req.body;
    for (let i = 0; i < allEmailArray.length; i++) {
      const currentRole: any = await knex("users")
        .select("role")
        .where("email", allEmailArray[i]);
      if (currentRole.rows[0].role == "user") {
        await knex("users")
          .update({ role: "admin" })
          .where("email", allEmailArray[i]);
      } else if (currentRole.rows[0].role == "admin") {
        await knex("users")
          .update({ role: "user" })
          .where("email", allEmailArray[i]);
      }
    }
    return res.json({ success: true, msg: "Upgrade users success" });
  } catch (error) {
    logger.error("Error :", error);
    return res.json({ success: false, msg: error });
  }
}

export default adminRoutes;
