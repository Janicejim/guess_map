import { Knex } from "knex";
import { Award, AwardRecord } from "../utils/model";

class AwardService {
  constructor(private knex: Knex) {}

  async getAward(sorting: string) {
    return (
      await this.knex.raw(
        `select id,image,name,score,quantity,status ,created_at ,(quantity-coalesce(count,0))as quota from award left join (select count(award_id)  as count,award_id from user_award group by award_id) as award_count on award.id=award_count.award_id
        where status='active' order by ${sorting}`
      )
    ).rows;
  }
  async createAward(awardInfo: Award) {
    await this.knex.insert(awardInfo).into("award");
    return;
  }
  async editAward(awardInfo: Award, awardId: number) {
    await this.knex("award").update(awardInfo).where("id", awardId);
    return;
  }
  async inactiveAward(awardId: number) {
    await this.knex("award")
      .update({ status: "inactive" })
      .where("id", awardId);
    return;
  }
  async getAwardRecords(user_id: number) {
    return (
      await this.knex.raw(
        `select award.name,award.image,user_award.score,user_award.created_at from user_award join award on user_award.award_id=award.id where user_id=? order by user_award.created_at desc`,
        [user_id]
      )
    ).rows;
  }
  async createAwardRecord(awardInfo: AwardRecord) {
    let txn = await this.knex.transaction();
    try {
      await txn.insert({
        user_id: awardInfo.user_id,
        score_change: -awardInfo.score,
        score_description_id: awardInfo.score_description_id,
      });

      await txn
        .insert({
          award_id: awardInfo.award_id,
          user_id: awardInfo.user_id,
          score: awardInfo.score,
        })
        .into("user_award");

      await txn.commit();
      return;
    } catch (e) {
      console.log(e);
      await txn.rollback();
      return;
    }
  }
  async getAwardScore(award_id: number) {
    return (
      await this.knex.select("score").from("award").where("id", award_id)
    )[0].score;
  }
  async checkAwardQuota(award_id: number) {
    let quantity = (
      await this.knex.select("quantity").from("award").where("id", award_id)
    )[0].quantity;
    let awardRedeemed = (
      await this.knex.raw(
        `select count(award_id) as count from user_award where award_id =? group by award_id `,
        [award_id]
      )
    ).rows[0];

    if (!awardRedeemed) {
      awardRedeemed = 0;
    } else {
      awardRedeemed = awardRedeemed.count;
    }

    return +quantity - +awardRedeemed;
  }
}

export default AwardService;
