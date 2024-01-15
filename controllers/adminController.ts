// import { io } from "../router/SocketRoute";
import AdminService from "../services/adminService";
import { Request, Response } from "express";

class AdminController {
  constructor(private adminService: AdminService) {}

  searchGame = async (req: Request, res: Response) => {
    const { searchText } = req.body;
    const gameInfo = await this.adminService.searchGame(searchText);
    return res.json(gameInfo.rows);
  };

  deleteGame = async (req: Request, res: Response) => {
    try {
      const allGameIDArray = req.body;
      for (let i = 0; i < allGameIDArray.length; i++) {
        await this.adminService.deleteGame(allGameIDArray[i]);
        // io.emit("updateGame");
      }
      return res.json({ success: true, msg: "delete Games success" });
    } catch (error) {
      console.error("Error :", error);
      return res.json({ success: false, msg: error });
    }
  };

  searchUser = async (req: Request, res: Response) => {
    const { searchText } = req.body;
    const userInfo = await this.adminService.searchUser(searchText);
    return res.json(userInfo.rows);
  };

  async SwitchGradeUser(req: Request, res: Response) {
    try {
      let { allEmailArray } = req.body;
      allEmailArray = JSON.parse(allEmailArray);
      for (let i = 0; i < allEmailArray.length; i++) {
        const currentRole = await this.adminService.getUserRole(
          allEmailArray[i]
        );
        if (currentRole[0].role == "user") {
          await this.adminService.updateUserRole(allEmailArray[i], "admin");
        } else if (currentRole[0].role == "admin") {
          await this.adminService.updateUserRole(allEmailArray[i], "user");
        }
      }
      return res.json({ success: true, msg: "Upgrade users success" });
    } catch (error) {
      console.log(error);
      return res.json({ success: false, msg: error });
    }
  }
}

export default AdminController;
