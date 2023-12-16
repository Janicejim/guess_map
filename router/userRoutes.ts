import express, { Request, Response } from "express";
import { knex } from "../utils/db";
import { checkPassword, hashPassword } from "../utils/hash";
import { logger } from "../utils/logger";
import { multerUpload } from "../utils/multer";
import { isLoggedIn } from "../utils/guard";

// import { format } from "date-fns";

const userRoutes = express.Router();

// ^^^^^^^^^^^^^^^^^^ for user upload profile ^^^^^^^^^^^^^^^^^^^^//

userRoutes.post("/login", login);
userRoutes.post("/register", register);
userRoutes.get("/login/google", loginGoogle);
userRoutes.get("/user", isLoggedIn, getUser);
userRoutes.get("/logout", logout);
userRoutes.get("/profile/:id", getProfile);
userRoutes.put("/profile", multerUpload, editProfile);

async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const results = await knex.select("*").from("users").where("email", email);

    if (results.length == 0) {
      logger.error("Email doesn't exist");
      return res.json({ success: false, error: "Email doesn't exist" });
    }

    if ((await checkPassword(password, results[0].password)) == false) {
      logger.error("Password Incorrect");
      return res.json({ success: false, error: "Password Incorrect" });
    }

    req.session["user"] = results[0];

    logger.info(`用戶 ${results[0].name} 已登入`);
    return res.json({ user: results[0].email });
  } catch (err) {
    logger.error("err: ", err);
    return res.json({ success: false, error: err });
  }
}

async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const checkingNE = await knex
      .select("*")
      .from("users")
      .where("email", email);
    if (checkingNE.length > 0) {
      return res.json(false);
    } else {
      if (email && password) {
        const createUserResult = await knex("users")
          .insert({
            name,
            email,
            profile_image: "anonymous.jpg",
            password: hashedPassword,
            role: "user",
          })
          .returning("id");

        const createUserRowCount = createUserResult.length;
        if (createUserRowCount === 1) {
          res.status(200).json({ msg: "register success!" });
          return;
        }
      }
      return res.json(false);
    }
  } catch (err) {
    logger.error("err: ", err);
    return res.json({ success: false, msg: "system error" });
  }
}

async function loginGoogle(req: Request, res: Response) {
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
  const users = await knex
    .select("*")
    .from("users")
    .where("email", googleUserInfo.email);

  const user = users[0];
  if (!user) {
    let hashedPassword = await hashPassword((Math.random() + 1).toString(36));
    const createUserResult = await knex("users")
      .insert({
        name: googleUserInfo.name,
        email: googleUserInfo.email,
        profile_image: "anonymous.jpg",
        password: hashedPassword,
        role: "user",
      })
      .returning("id");

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
}

async function getUser(req: Request, res: Response) {
  let currentUserId = req.session["user"].id;
  let user = await knex.select("*").from("users").where("id", currentUserId);
  return res.json({ user });
}

async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ success: false });
    }
    return res.json({ success: true });
  });
}

async function getProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userInfo = (
      await knex.raw(
        `select users.id,name,email,profile_image ,description ,role,total_score from users full join (select user_id,sum(score_change) as total_score from score_record group by user_id) as score on users.id=score.user_id where users.id=?
    `,
        [id]
      )
    ).rows[0];
    if (!userInfo.total_score) {
      userInfo.total_score = 0;
    }
    const level = (
      await knex.raw(
        `select name as level from level where min_score<=? and max_score>=?`,
        [userInfo.total_score, userInfo.total_score]
      )
    ).rows[0].level;

    res.json({ userInfo, level });
  } catch (error) {
    logger.error("error: ", error);
  }
}

async function editProfile(req: Request, res: Response) {
  try {
    const currentUserId = await req.session["user"].id;
    const { name, description } = req.body;
    const profile_image = req.file?.filename;

    if (profile_image) {
      await knex("users")
        .update({ name, profile_image, description })
        .where("id", currentUserId);
    } else {
      await knex("users")
        .update({ name, description })
        .where("id", currentUserId);
    }

    res.json({ success: true });
  } catch (err) {
    logger.error("error: ", err);
    res.json({ success: false, error: err });
  }
}

export default userRoutes;
