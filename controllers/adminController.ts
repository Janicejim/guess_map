import AdminService from "../services/adminService";
import { Request, Response } from "express";

class AdminController {
  constructor(private adminService: AdminService) { }

  searchUser = async (req: Request, res: Response) => {
    const { searchText } = req.body;
    if (!searchText) {
      res.json({ success: false, msg: "欠缺資料" });
      return;
    }
    const userInfo = await this.adminService.searchUser(searchText);
    return res.json({ success: true, data: userInfo.rows });
  };

  switchGradeUser = async (req: Request, res: Response) => {
    try {
      let { allEmailArray } = req.body;
      if (!allEmailArray || allEmailArray.length == 0) {
        res.json({ success: false, msg: "欠缺資料" });
        return;
      }
      for (let userEmail of allEmailArray) {
        const currentRole = await this.adminService.getUserRole(userEmail);
        if (currentRole == "user") {
          await this.adminService.updateUserRole(userEmail, "admin");
        } else if (currentRole == "admin") {
          await this.adminService.updateUserRole(userEmail, "user");
        }
      }
      return res.json({ success: true, msg: "切換成功" });
    } catch (error) {
      console.log(error);
      return res.json({ success: false, msg: "系統出現問題，新稍後再試" });
    }
  };
}

export default AdminController;
