import AwardService from "../services/awardService";
import { Request, Response } from "express";
import { createFormidableS3Form } from "../utils/formidable";

class AwardController {
  constructor(
    private awardService: AwardService,
  ) { }

  getAward = async (req: Request, res: Response) => {
    try {
      let { sorting } = req.query;
      if (!sorting) {
        sorting = "award.created_at desc";
      }

      let awards = await this.awardService.getAward(sorting.toString());

      if (req.query.limited) {
        awards = awards.slice(0, +req.query.limited);
      }
      res.json({ success: true, data: awards });
    } catch (e) {
      console.log(e);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };

  createAward = async (req: Request, res: Response) => {
    const form = createFormidableS3Form()

    form.parse(req, async (err, fields, files) => {
      try {

        let image = "";

        if (files.hasOwnProperty("image")) {
          image = Array.isArray(files.image) ? files.image[0].newFilename : files.image!.newFilename;
        }

        let { name, score, quantity } = fields;
        if (!name || !score || !quantity) {
          res.json({ success: false, msg: "欠缺資料" });
          return;
        }

        await this.awardService.createAward({
          image,
          name: name as string,
          score: +score,
          quantity: +quantity,
          status: "active",
        });
        res.json({ success: true, msg: "創建成功" });
      } catch (e) {
        console.log(e);
        res.json({ success: false, msg: "系統出錯，請稍候再試" });
      }


    })


  };

  inactiveAward = async (req: Request, res: Response) => {
    try {
      let { awardId } = req.query;
      if (!awardId) {
        res.json({ success: false, msg: "欠缺資料" });
        return;
      }
      await this.awardService.inactiveAward(+awardId);
      res.json({ success: true, msg: "刪除成功" });
    } catch (e) {
      console.log(e);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };

  editAward = async (req: Request, res: Response) => {
    const form = createFormidableS3Form()
    form.parse(req, async (err, fields, files) => {
      try {
        let image = "";

        if (files.hasOwnProperty("image")) {
          image = Array.isArray(files.image) ? files.image[0].newFilename : files.image.newFilename;
        }
        let body = fields
        let { awardId } = req.query;
        if (!awardId) {
          res.json({ success: false, msg: "欠缺資料" });
          return;
        }
        if (image) {
          body["image"] = image;
        }

        await this.awardService.editAward(body, +awardId);
        res.json({ success: true, msg: "編輯成功" });
      } catch (e) {
        console.log(e);
        res.json({ success: false, msg: "系統出錯，請稍候再試" });
      }
    })

  };

  getAwardRecord = async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        res.json({ success: false, msg: "請先登入" });
        return;
      }
      let user_id = req.session.user.id;

      let awardRecords = await this.awardService.getAwardRecords(user_id);
      res.json({ success: true, data: awardRecords });
    } catch (e) {
      console.log(e);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };

  createAwardRecord = async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        res.json({ success: false, msg: "請先登入" });
        return;
      }
      let user_id = req.session.user.id;
      let { award_id } = req.query;
      if (!award_id) {
        res.json({ success: false, msg: "欠缺資料" });
        return;
      }
      let result = await this.awardService.checkUserScore(user_id)
      let userScore = result[0].total_score;

      let score = await this.awardService.getAwardScore(+award_id);

      if (+userScore < +score) {
        res.json({ success: false, msg: "積分不足" });
        return;
      }
      let awardQuota = await this.awardService.checkAwardQuota(+award_id);
      if (awardQuota <= 0) {
        res.json({ success: false, msg: "庫存不足" });
        return;
      }
      let score_description_id = await this.awardService.getScoreDescriptionId(
        "兌換"
      );

      await this.awardService.createAwardRecord({
        award_id: +award_id,
        user_id,
        score_description_id,
        score,
      });

      res.json({
        success: true,
        msg: "兌換成功,電子券已傳至閣下郵箱，請查收！",
      });
    } catch (e) {
      console.log(e);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };
}

export default AwardController;
