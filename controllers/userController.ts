import UserService from "../services/userService";
import { checkPassword, hashPassword } from "../utils/hash";
import { Request, Response } from "express";
class UserController {
  constructor(private userService: UserService) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const results = await this.userService.getUserMyEmail(email);

      if (results.length == 0) {
        console.error("Email doesn't exist");
        return res.json({ success: false, error: "Email doesn't exist" });
      }

      if ((await checkPassword(password, results[0].password)) == false) {
        console.error("Password Incorrect");
        return res.json({ success: false, error: "Password Incorrect" });
      }

      req.session["user"] = results[0];

      return res.json({ role: results[0].role });
    } catch (err) {
      console.error("err: ", err);
      return res.json({ success: false, error: err });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await hashPassword(password);
      const checkUserRecord = await this.userService.getUserMyEmail(email);
      if (checkUserRecord.length > 0) {
        return res.json(false);
      } else {
        if (email && password) {
          const createUserResult = await this.userService.createUser({
            name,
            email,
            profile_image: "anonymous.jpg",
            password: hashedPassword,
            role: "user",
          });

          if (createUserResult) {
            res.status(200).json({ msg: "register success!" });
            return;
          }
        }
        return res.json(false);
      }
    } catch (err) {
      console.error("err: ", err);
      return res.json({ success: false, msg: "system error" });
    }
  };

  loginGoogle = async (req: Request, res: Response) => {
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
    console.log(googleUserInfo.email);
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

      const createUserRowCount = createUserResult.length;
      if (createUserRowCount != 1) {
        res.status(401).json({ msg: "insert fail" });
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
        return res.json({ success: false });
      }
      return res.json({ success: true });
    });
  };

  getUserInfo = async (req: Request, res: Response) => {
    try {
      let id = 0;
      let getCurrentUser = false;
      if (req.query.id) {
        id = +req.query.id;
        getCurrentUser = false;
      } else if (req.session["user"] !== undefined) {
        id = +req.session["user"].id;
        getCurrentUser = true;
      } else {
        res.json("haven't login");
        return;
      }

      const userInfo = await this.userService.getUserInfo(id);
      if (!userInfo.total_score) {
        userInfo.total_score = 0;
      }

      res.json({ user: userInfo, getCurrentUser });
    } catch (error) {
      console.error("error: ", error);
      res.json(error);
    }
  };

  editProfile = async (req: Request, res: Response) => {
    try {
      const currentUserId = req.session["user"].id;
      const { name, description } = req.body;
      const profile_image = req.file?.filename;

      if (profile_image) {
        await this.userService.updateProfile(
          { name, profile_image, description },
          currentUserId
        );
      } else {
        await this.userService.updateProfile(
          { name, description },
          currentUserId
        );
      }

      res.json({ success: true });
    } catch (err) {
      console.error("error: ", err);
      res.json({ success: false, error: err });
    }
  };
}

export default UserController;
