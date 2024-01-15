import multer from "multer";

const singleStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    /* cb = callback */
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    console.log({ file });
    let time = new Date().toISOString();
    cb(null, `media-${time}.${file.mimetype.split("/")[1]}`);
  },
});

const upload = multer({ storage: singleStorage });

export const multerUpload = upload.single("image");
