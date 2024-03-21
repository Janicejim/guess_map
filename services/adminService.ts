import { Knex } from "knex";

class AdminService {
  constructor(private knex: Knex) {}

  async searchGame(searchText: string) {
    return await this.knex.raw(
      `select name,profile_image,game.media,game.created_at,game.id from users inner join game on users.id= game.user_id where email LIKE ? OR name LIKE ?`,
      [`%${searchText}%`, `%${searchText}%`]
    );
  }

  async deleteGame(gameId: number) {
    await this.knex("game").update({ status: "inactive" }).where("id", gameId);
    return;
  }

  async searchUser(searchText: string) {
    return await this.knex.raw(
      `select name,email,profile_image,role from users where email LIKE ? OR name LIKE ? order by role asc`,
      [`%${searchText}%`, `%${searchText}%`]
    );
  }

  async getUserRole(email: string) {
    return (await this.knex("users").select("role").where("email", email))[0]
      .role;
  }

  async updateUserRole(email: string, role: string) {
    await this.knex("users").update({ role }).where("email", email);
    return;
  }
}

export default AdminService;
