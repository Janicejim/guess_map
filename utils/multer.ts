import multer from "multer";

const singleStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    let time = Date.now();
    cb(null, `media-${time}.${file.mimetype.split("/")[1]}`);
  },
});

const uploadLocal = multer({ storage: singleStorage });

export const multerUpload = uploadLocal.single("image");

