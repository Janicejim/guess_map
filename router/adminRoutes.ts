import express, { Request, Response } from "express";
import { client } from "../db";
import { logger } from "../logger";
import { io } from "./SocketRoute";

const adminRoutes = express.Router();

adminRoutes.put("/searchGame", searchGame);
adminRoutes.delete("/deleteGame", deleteGame);

adminRoutes.put("/searchUser", searchUser);
adminRoutes.put("/upgradeUser", SwitchGradeUser);
adminRoutes.delete("/deleteUser", deleteUser);

// async function searchGame(){
//     const gameInfo = await client.query(`select * from `)
// }

async function searchGame(req: Request, res: Response) {
  // console.log("mark-server01");
  const { searchText } = req.body;
  const gameInfo = await client.query(
    `select name,profile_image,game.media,game.created_at,game.id from users inner join game on users.id= game.user_id where email LIKE '%${searchText}%' OR name LIKE '%${searchText}%'`
  );
  console.table(gameInfo.rows);
  return res.json(gameInfo.rows);
}

async function deleteGame(req: Request, res: Response) {
  try {
    const allGameIDArray = req.body;
    for (let i = 0; i < allGameIDArray.length; i++) {
      await client.query(
        `delete from likes where game_id='${allGameIDArray[i]}'`
      );
      await client.query(
        `delete from dislikes where game_id='${allGameIDArray[i]}'`
      );
      await client.query(
        `delete from game_history where game_id='${allGameIDArray[i]}'`
      );
      await client.query(`delete from game where id='${allGameIDArray[i]}'`),
        logger.info(`Delete Game ID: ${allGameIDArray[i]} success!!`);
      io.emit("updateGame");
    }
  } catch (error) {
    logger.error("Error :", error);
  }
  return res.json({ success: true, msg: "delete Games success" });
}

async function searchUser(req: Request, res: Response) {
  const { searchText } = req.body;
  const userInfo = await client.query(
    `select name,email,profile_image,role from users where email LIKE '%${searchText}%' OR name LIKE '%${searchText}%' order by role asc`
  );
  console.table(userInfo.rows);
  return res.json(userInfo.rows);
}

async function SwitchGradeUser(req: Request, res: Response) {
  try {
    const allEmailArray = req.body;
    logger.info("allEmailArray", allEmailArray);
    for (let i = 0; i < allEmailArray.length; i++) {
      logger.info("allEmailArray", allEmailArray[i]);
      const currentRole: any = await client.query(
        `select role from users where email='${allEmailArray[i]}'`
      );
      logger.info("currentRole", currentRole.rows[0].role);
      if (currentRole.rows[0].role == "0") {
        logger.info("member to admin");
        await client.query(
          `update users set role='9' where email='${allEmailArray[i]}'`
        );
      } else if (currentRole.rows[0].role == "9") {
        logger.info("admin to member");
        await client.query(
          `update users set role='0' where email='${allEmailArray[i]}'`
        );
      } else {
        logger.info("role number not in condition");
        return false;
      }
      logger.info(`change  user${allEmailArray[i]} grade  success!!`);
    }
  } catch (error) {
    logger.error("Error :", error);
  }
  return res.json({ success: true, msg: "Upgrade users success" });
}

// async function upgradeUser(req: Request, res: Response) {
//   try {
//     const allEmailArray = req.body;
//     for (let i = 0; i < allEmailArray.length; i++) {
//       await client.query(
//         `update users set role='9' where email='${allEmailArray[i]}'`
//       );
//       logger.info(`Upgrade user${allEmailArray[i]} to Admin success!!`);
//     }
//   } catch (error) {
//     logger.error("Error :", error);
//   }
//   return res.json({ success: true, msg: "Upgrade users success" });
// }

async function deleteUser(req: Request, res: Response) {
  try {
    const allEmailArray = req.body;
    for (let i = 0; i < allEmailArray.length; i++) {
      await client.query(`delete from users where email='${allEmailArray[i]}'`);
      logger.info(`Delete user${allEmailArray[i]} success!!`);
    }
  } catch (error) {
    logger.error("Error :", error);
  }
  return res.json({ success: true, msg: "delete users success" });
}

export default adminRoutes;
