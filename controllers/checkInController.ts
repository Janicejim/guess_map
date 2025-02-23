import CheckInService from "../services/checkInService";
import { Request, Response } from "express";
import { checkDistance } from "../utils/distance";
import { CheckInData } from "../utils/model";
import { form } from "../utils/formidable";
class CheckInController {
  constructor(private checkInService: CheckInService) { }

  addCheckInRecord = async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        res.json({ success: false, msg: "請先登入" });
        return;
      }
      let user_id = req.session.user.id;
      let { gameId } = req.query;
      let { targeted_location_x, targeted_location_y } = req.body;

      if (!gameId) {
        res.json({ success: false, msg: "欠缺資料" });
        return;
      }
      let oldRecord = await this.checkInService.isCheckIn(user_id, +gameId);
      if (oldRecord.length > 0) {
        res.json({ success: false, msg: "已經打過卡" });
        return;
      }

      let gameData = await this.checkInService.checkGameData(+gameId);

      //compare user targeted_location and answer:
      let distanceAfterCompare = checkDistance(
        { x: targeted_location_x, y: targeted_location_y },
        {
          x: gameData.x,
          y: gameData.y,
        }
      );

      if (distanceAfterCompare > 200) {
        res.json({
          success: false,
          msg: "身處位置和打卡位相距多於200米,請再嘗試",
        });
        return;
      }

      let id = await this.checkInService.addCheckInRecord({
        user_id: +user_id,
        game_id: +gameId,
        status: "active",
      });

      res.json({
        success: true,
        msg: "打卡成功",
        data: id,
      });
    } catch (e) {
      console.log(e);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };

  updateCheckInData = async (req: Request, res: Response) => {

    try {
      let { id } = req.query;
      let { message } = req.body;

      if (!id) {
        res.json({ success: false, msg: "欠缺資料" });
        return;
      }
      let data: CheckInData = { id: +id };
      let image = req.file?.fieldname

      if (image) {
        data["image"] = image;
      }
      if (message) {
        data["message"] = message as string
      }
      if (!image && !message) {
        res.json({ success: false, msg: "沒有要更新的資料" });
        return;
      }

      await this.checkInService.updateCheckInData(data);

      res.json({ success: true, msg: "編輯成功" });
    } catch (e) {
      console.log(e);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }




  };
  getCheckInRecordByUser = async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        res.json({ success: false, msg: "請先登入" });
        return;
      }
      let userId = 0;
      if (req.query.id) {
        userId = +req.query.id;
      } else {
        userId = req.session["user"].id;
      }
      let result = await this.checkInService.getAllCheckInRecordOfUser(userId);

      res.json({ success: true, data: result });
    } catch (e) {
      console.log(e);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };
  isCheckIn = async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        res.json({ success: false, msg: "請先登入" });
        return;
      }
      let userId = req.session.user.id;
      let { gameId } = req.query;
      if (!gameId) {
        res.json({ success: false, msg: "欠缺資料" });
        return;
      }
      let result = await this.checkInService.isCheckIn(userId, +gameId);

      if (result.length > 0) {
        res.json({ success: true, data: true });
      } else {
        res.json({ success: true, data: false });
      }
    } catch (e) {
      console.log(e);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };

  getGameAllCheckInRecord = async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        res.json({ success: false, msg: "請先登入" });
        return;
      }

      let { gameId } = req.query;
      if (!gameId) {
        res.json({ success: false, msg: "欠缺資料" });
        return;
      }
      let result = await this.checkInService.getGameAllCheckInRecord(+gameId);
      res.json({ success: true, data: result });
    } catch (e) {
      console.log(e);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };
}

export default CheckInController;
