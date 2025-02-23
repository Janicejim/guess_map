import UserService from "../services/userService";
import { form } from "../utils/formidable";
import { checkPassword, hashPassword } from "../utils/hash";
import { Request, Response } from "express";
class UserController {
  constructor(private userService: UserService) { }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const results = await this.userService.getUserMyEmail(email);

      if (results.length == 0) {
        res.json({ success: false, msg: "用戶未有註冊" });
        return;
      }

      if ((await checkPassword(password, results[0].password)) == false) {
        res.json({ success: false, msg: "電郵/密碼有錯誤" });
        return;
      }

      req.session["user"] = results[0];

      res.json({ success: true, data: results[0].role });
    } catch (err) {
      console.error("err: ", err);
      res.json({ success: false, error: "系統出錯，請稍候再試" });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await hashPassword(password);
      const checkUserRecord = await this.userService.getUserMyEmail(email);
      if (checkUserRecord.length > 0) {
        res.json({ success: false, msg: "用戶已註冊" });
        return;
      }
      if (email && password) {
        await this.userService.createUser({
          name,
          email,
          profile_image: "anonymous.jpg",
          password: hashedPassword,
          role: "user",
        });
      }
      res.json({ success: true, msg: "註冊成功" });
    } catch (err) {
      console.error("err: ", err);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };

  loginGoogle = async (req: Request, res: Response) => {
    if (!req.session.grant) {
      res.json({ success: false, msg: "無法取得授權" });
      return;
    }
    const accessToken = req.session?.["grant"].response.access_token;
    const fetchRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const googleUserInfo: any = await fetchRes.json();
    const users = await this.userService.getUserMyEmail(googleUserInfo.email);
    const user = users[0];
    if (!user) {
      let hashedPassword = await hashPassword((Math.random() + 1).toString(36));
      const createUserResult = await this.userService.createUser({
        name: googleUserInfo.name,
        email: googleUserInfo.email,
        profile_image: "anonymous.jpg",
        password: hashedPassword,
        role: "user",
      });


      if (!createUserResult) {
        res.status(401).json({ success: false, msg: "系統出錯，請稍候再試" });
        return;
      }
    }
    if (req.session) {
      req.session["user"] = user;
    }
    return res.redirect("/");
  };

  logout = async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        res.json({ success: false, msg: "系統出錯，請稍候再試" });
        return;
      }
      return res.json({ success: true, msg: "登出成功" });
    });
  };

  getUserInfo = async (req: Request, res: Response) => {
    try {
      let id = 0;
      let getCurrentUser = false;
      if (req.query.id) {
        id = +req.query.id;
      } else if (req.session["user"] !== undefined) {
        id = +req.session["user"].id;
        getCurrentUser = true;
      } else {
        res.json({ success: false, msg: "未登入" });
        return;
      }

      const userInfo = await this.userService.getUserInfo(id);
      if (!userInfo.total_score) {
        userInfo.total_score = 0;
      }

      res.json({ success: true, data: { user: userInfo, getCurrentUser } });
    } catch (error) {
      console.error("error: ", error);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };

  editProfile = async (req: Request, res: Response) => {
    form.parse(req, async (err, fields, files) => {
      try {
        if (!req.session.user) {
          res.json({ success: false, msg: "請先登入" });
          return;
        }
        const currentUserId = req.session["user"].id;
        const { name, description } = fields

        let profile_image = "";

        if (files.hasOwnProperty("image")) {
          profile_image = Array.isArray(files.image) ? files.image[0].newFilename : files.image.newFilename;
        }

        if (profile_image) {
          await this.userService.updateProfile(
            { name: name as string, profile_image: profile_image as string, description: description as string },
            currentUserId
          );
        } else {
          await this.userService.updateProfile(
            { name: name as string, description: description as string },
            currentUserId
          );
        }

        res.json({ success: true, msg: "修改成功" });
      } catch (err) {
        console.error("error: ", err);
        res.json({ success: false, msg: "系統出錯，請稍候再試" });
      }
    })

  };

  isLogin = async (req: Request, res: Response) => {
    try {
      if (req.session["user"]) {
        res.json({ success: true, data: true });
      } else {
        res.json({ success: true, data: false });
      }
    } catch (error) {
      console.error("error: ", error);
      res.json({ success: false, msg: "系統出錯，請稍候再試" });
    }
  };
}

export default UserController;
