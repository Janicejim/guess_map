import AwardService from "../services/awardService";
import { Request, Response } from "express";
import GameService from "../services/gameService";

class AwardController {
  constructor(
    private awardService: AwardService,
    private gameService: GameService
  ) {}

  getAward = async (req: Request, res: Response) => {
    try {
      let { sorting } = req.query;
      if (!sorting) {
        sorting = "score desc";
      }

      let awards = await this.awardService.getAward(sorting.toString());

      if (req.query.limited) {
        awards = awards.slice(0, +req.query.limited);
      }
      res.json(awards);
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };

  createAward = async (req: Request, res: Response) => {
    try {
      let image = req.file?.filename;
      if (!image) {
        res.json("missing image");
        return;
      }
      let { name, score, quantity } = req.body;
      if (!name || !score || !quantity) {
        res.json("missing body item");
        return;
      }

      await this.awardService.createAward({
        image,
        name,
        score,
        quantity,
        status: "active",
      });
      res.json("create success");
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };

  inactiveAward = async (req: Request, res: Response) => {
    try {
      let { awardId } = req.query;
      if (!awardId) {
        res.json("missing query");
        return;
      }
      await this.awardService.inactiveAward(+awardId);
      res.json("inactive");
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };

  editAward = async (req: Request, res: Response) => {
    try {
      let image = req.file?.filename;
      let body = req.body;
      let { awardId } = req.query;
      if (!awardId) {
        res.json("missing query");
        return;
      }
      if (image) {
        body["image"] = image;
      }

      await this.awardService.editAward(body, +awardId);
      res.json("edit success");
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };

  getAwardRecord = async (req: Request, res: Response) => {
    try {
      let user_id = req.session.user.id;

      let awardRecords = await this.awardService.getAwardRecords(user_id);
      res.json(awardRecords);
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  };

  createAwardRecord = async (req: Request, res: Response) => {
    try {
      let user_id = req.session.user.id;
      let { award_id } = req.query;
      if (!award_id) {
        res.json("missing query");
        return;
      }
      let userScore = (await this.gameService.checkUserScore(user_id))[0]
        .total_score;

      let score = await this.awardService.getAwardScore(+award_id);

      if (+userScore < +score) {
        res.json("積分不足");
        return;
      }
      let awardQuota = await this.awardService.checkAwardQuota(+award_id);
      console.log({ awardQuota });
      if (awardQuota <= 0) {
        res.json("庫存不足");
        return;
      }
      let score_description_id = await this.gameService.getScoreDescriptionId(
        "兌換"
      );

      await this.awardService.createAwardRecord({
        award_id,
        user_id,
        score_description_id,
        score,
      });
      res.json("兌換成功,電子券已傳至閣下郵箱，請查收！");
    } catch (e) {
      console.log(e);
      res.json("系統出現問題");
    }
  };
}

export default AwardController;
