import multer from "multer";






// const userProfileStorage = multer.diskStorage({ 
//     destination: function (req: Request, file: any, cb: any) {
//         cb(null, path.resolve('./profileUploads'));
//     },
//     filename: function (req: Request, file: any, cb: any) {
//         cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype.split('/')[1]}`);
//     }
// })
// const userProfileUpload = multer ({storage: userProfileStorage})
// export const multerFormProfile = userProfileUpload.single('image');


// ^^^^^^^^^^^^^^^^^^ for user upload profile ^^^^^^^^^^^^^^^^^^^^//

// const singleStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         /* cb = callback */
//         cb(null, "uploads");
//     },
//     filename: function (req, file, cb) {
//         cb(null, `media-${file.fieldname}.${file.mimetype.split("/")[1]}`);
//     },
// });

const singleStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        /* cb = callback */
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `media-${file.fieldname}.${file.mimetype.split("/")[1]}`);
    },
});


// const mediaUpload = multer({ storage: singleStorage });


// // req.file
// export const multerFormSingle = mediaUpload.single("media");



