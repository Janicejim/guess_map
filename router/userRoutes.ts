import express, { Request, Response } from "express";
import { client } from "../db";
import { checkPassword, hashPassword } from "../hash";
import { logger } from "../logger";
import fetch from "node-fetch";
import multer from "multer";
import path from "path";
// import { format } from "date-fns";

const userRoutes = express.Router();

//-------------------  for user upload profile ---------------------//

const userProfileStorage = multer.diskStorage({
  destination: function (req: Request, file: any, cb: any) {
    cb(null, path.resolve("./profileUploads"));
  },
  filename: function (req: Request, file: any, cb: any) {
    cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype.split("/")[1]}`);
  },
});
const userProfileUpload = multer({ storage: userProfileStorage });
const multerFormProfile = userProfileUpload.single("image");

// ^^^^^^^^^^^^^^^^^^ for user upload profile ^^^^^^^^^^^^^^^^^^^^//

userRoutes.post("/login", login);
userRoutes.post("/register", register);
userRoutes.get("/login/google", loginGoogle);
userRoutes.get("/user", getUser);
userRoutes.get("/logout", logout);
userRoutes.post("/profile/:id", multerFormProfile, profile);
userRoutes.put("/editProfile", multerFormProfile, editProfile);

async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const results = await client.query(
      `select * from users where email='${email}'`
    );

    if (results.rows.length == 0) {
      logger.error("Email doesn't exist");
      return res.json({ success: false, error: "Email doesn't exist" });
    }

    if ((await checkPassword(password, results.rows[0].password)) == false) {
      logger.error("Password Incorrect");
      return res.json({ success: false, error: "Password Incorrect" });
    }

    req.session["user"] = results.rows[0];
    // console.log('results.rows[0]', results.rows[0]);

    logger.info(`用戶 ${results.rows[0].name} 已登入`);
    // return res.redirect("/")
    return res.json({ user: results.rows[0].email });
  } catch (err) {
    logger.error("err: ", err);
    return res.json({ success: false, error: err });
  }
}

async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    // console.log('hashedPassword', hashedPassword);
    const checkingNE = await checkNameEmail(name, email);
    const descriptionCon = "Please write your info here";
    if (checkingNE === false) {
      return res.json(false);
    } else {
      if (checkingNE === true && email && password) {
        const createUserResult = await client.query(
          `insert into users (name,email,profile_image,password,description,total_score,level,role,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id`,
          [
            name,
            email,
            "anonymous.jpg",
            hashedPassword,
            descriptionCon,
            "0",
            "0",
            "0",
            "NOW()",
            "NOW()",
          ]
        );
        const createUserRowCount = createUserResult.rowCount;
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

async function checkNameEmail(name: any, email: any) {
  // const dbNames = await client.query(`select name from users`)
  const dbEmails = await client.query(`select email from users`);

  // for(let i=0; i< dbNames.rows.length;i++){
  //   // console.log('dbName', dbNames.rows[i].name);
  //   if (name == dbNames.rows[i].name) {
  //     logger.error("name used")
  //     return false
  //   }
  // }
  for (let j = 0; j < dbEmails.rows.length; j++) {
    if (email == dbEmails.rows[j].email) {
      logger.error("email.used");
      return false;
    }
  }
  return true;
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
  const googleUserInfo = await fetchRes.json();
  const users = (
    await client.query(`SELECT * FROM users WHERE email = $1`, [
      googleUserInfo.email,
    ])
  ).rows;
  // console.log('users', users);
  const descriptionCon = "Please write your info here";
  const user = users[0];
  if (!user) {
    let hashedPassword = await hashPassword((Math.random() + 1).toString(36));
    const createUserResult = await client.query(
      `insert into users (name,email,password,description,total_score,level,role,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,
      [
        googleUserInfo.name,
        googleUserInfo.email,
        hashedPassword,
        descriptionCon,
        "0",
        "0",
        "0",
        "NOW()",
        "NOW()",
      ]
    );
    const createUserRowCount = createUserResult.rowCount;
    if (createUserRowCount != 1) {
      res.status(401).json({ msg: "insert fail" });
      return;
    }
  }
  if (req.session) {
    req.session["user"] = user;
  }
  return res.redirect("/");
  // return res.status(200).json("It is for logout");
}

async function getUser(req: Request, res: Response) {
  return res.json({ user: req.session["user"] });
}

async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ success: false });
    }
    return res.json({ success: true });
  });
}

async function profile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // console.log('id', id);
    const userPro = await client.query(
      `select id,name,profile_image,level,email,description,total_score,created_at from users where id=${id}`
    );
    logger.info("select user profile success");
    // res.redirect()
    res.json(userPro.rows[0]);
    // console.log('userPro.rows', userPro.rows[0]);
  } catch (error) {
    logger.error("error: ", error);
  }
}

async function editProfile(req: Request, res: Response) {
  try {
    const currentUserEmail = await req.session["user"].email;
    const { name, description } = req.body;
    const image = req.file?.filename;

    // if have image/name/description condition setup
    if (image && name != "" && description != "") {
      await client.query(
        `update users set name='${name}',profile_image='${image}',description='${description}' where email='${currentUserEmail}'`
      );
    } else if (image && name != "") {
      await client.query(
        `update users set name='${name}',profile_image='${image}' where email='${currentUserEmail}'`
      );
    } else if (image && description != "") {
      await client.query(
        `update users set profile_image='${image}',description='${description}' where email='${currentUserEmail}'`
      );
    } else if (image) {
      await client.query(
        `update users set profile_image='${image}' where email='${currentUserEmail}'`
      );
    } else if (name != "" && description != "") {
      await client.query(
        `update users set name='${name}',description='${description}' where email='${currentUserEmail}'`
      );
    } else if (name != "") {
      await client.query(
        `update users set name='${name}' where email='${currentUserEmail}'`
      );
    } else if (description != "") {
      await client.query(
        `update users set description='${description}' where email='${currentUserEmail}'`
      );
    } else {
      res.json({ success: false });
    }
    const user = await client.query(
      `select * from users where email ='${currentUserEmail}' `
    );
    req.session["user"] = user.rows[0];

    res.json({ success: true });
  } catch (err) {
    logger.error("error: ", err);
    res.json({ success: false, error: err });
  }
}

// async function adminAccess(req: Request, res: Response){

// }

export default userRoutes;
