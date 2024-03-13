import CheckInService from "../services/checkInService";
import { Request, Response } from "express";
import { checkDistance } from "../utils/distance";
class CheckInController {
  constructor(private checkInService: CheckInService) {}

  getCollectionByUser = async (req: Request, res: Response) => {
    try {
      let userId = req.session.user.id;
      let result = await this.checkInService.getCollectionByUser(userId);

      res.json(result);
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };

  addOrInactiveCollection = async (req: Request, res: Response) => {
    try {
      let userId = req.session.user.id;
      let { gameId } = req.query;
      if (!gameId) {
        res.json("missing query");
        return;
      }

      let oldRecord = await this.checkInService.checkOldCollectionRecord(
        userId,
        +gameId
      );
      if (oldRecord.length == 0) {
        await this.checkInService.addCollection(userId, +gameId);
      } else if (oldRecord.length > 0 && oldRecord[0].status == "inactive") {
        await this.checkInService.updatedCollectionRecordStatus(
          oldRecord[0].id,
          "active"
        );
      } else if (oldRecord.length > 0 && oldRecord[0].status == "active") {
        await this.checkInService.updatedCollectionRecordStatus(
          oldRecord[0].id,
          "inactive"
        );
      }

      res.json("success");
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };

  addCheckInRecord = async (req: Request, res: Response) => {
    try {
      let user_id = req.session.user.id;
      let { gameId } = req.query;
      let { targeted_location_x, targeted_location_y } = req.body;
      targeted_location_x = 22.283047923532244;
      targeted_location_y = 114.15359294197071;

      if (!gameId) {
        res.json("missing query");
        return;
      }
      let oldRecord = await this.checkInService.checkOldCheckInRecord(
        user_id,
        +gameId
      );
      if (oldRecord.length > 0) {
        res.json({
          msg: "已經打過卡",
          success: false,
        });
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
          msg: "身處位置和打卡位相距多於200米，請再嘗試",
          success: false,
        });
        return;
      }

      let id = await this.checkInService.addCheckInRecord({
        user_id: +user_id,
        game_id: +gameId,
        status: "active",
      });

      res.json({
        msg: "打卡成功",
        success: true,
        recordId: id,
      });
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };

  updateCheckInData = async (req: Request, res: Response) => {
    try {
      let { id } = req.query;
      const image = req.file?.filename;
      let { message } = req.body;

      if (!id) {
        res.json({ success: false, msg: "欠缺資料" });
        return;
      }
      let data: any = { id: +id };
      if (image) {
        data["image"] = image;
      }
      if (message) {
        data["message"] = message;
      }
      if (!image && !message) {
        res.json({ success: false, msg: "沒有任何更新" });
        return;
      }

      await this.checkInService.updateCheckInData(data);

      res.json({ success: true, msg: "編輯成功" });
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };
  getCheckInRecordByUser = async (req: Request, res: Response) => {
    try {
      let userId = req.session.user.id;
      let result = await this.checkInService.getAllCheckInRecordOfUser(userId);

      res.json(result);
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };
  checkOldCheckInRecordByGame = async (req: Request, res: Response) => {
    try {
      let userId = req.session.user.id;
      let { gameId } = req.query;
      if (!gameId) {
        res.json("missing query");
        return;
      }
      let result = await this.checkInService.checkOldCheckInRecord(
        userId,
        +gameId
      );

      if (result.length > 0) {
        res.json({ checked: true });
      } else {
        res.json({ checked: false });
      }
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };
}

export default CheckInController;
