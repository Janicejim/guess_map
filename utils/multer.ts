import multer from "multer";

const singleStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    /* cb = callback */
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `media-${file.fieldname}.${file.mimetype.split("/")[1]}`);
  },
});

const upload = multer({ storage: singleStorage });

export const multerUpload = upload.single("image");
