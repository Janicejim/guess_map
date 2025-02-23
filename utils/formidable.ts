import formidable from "formidable";
import fs from "fs";
const uploadDir = "uploads";
fs.mkdirSync(uploadDir, { recursive: true });

let counter = 0;


export function createFormidableLocalForm() {
    return formidable({
        uploadDir,
        keepExtensions: true,
        maxFiles: 1,
        maxFileSize: 200 * 1024,
        filter: (part) => part.mimetype?.startsWith("image/") || false,
        filename: (originalName, originalExt, part, form) => {
            let fieldName = part.name;
            let timestamp = Date.now();
            let ext = part.mimetype?.split("/").pop();
            counter++;
            return `${fieldName}-${timestamp}-${counter}.${ext}`;
        },
    });

}



import aws from "aws-sdk";
import stream from "stream";
import { env } from "./env";

let credentials = new aws.Credentials({
    accessKeyId: env.AWS_ACCESS_KEY_ID! + "",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY! + "",
});

let s3 = new aws.S3({
    credentials,
    region: env.S3_REGION,
});

let filename = "";

export function createFormidableS3Form() {
    return formidable({
        fileWriteStreamHandler() {
            let passThroughStream = new stream.PassThrough();
            let upload = s3.upload(
                {
                    Body: passThroughStream,
                    Bucket: env.S3_BUCKET_NAME!,
                    Key: filename,
                    ContentType: "image/jpg, image/png, image/jpeg",
                },
                {}
            );

            upload.send();
            return passThroughStream;
        },
        filename: (originalName, originalExt, part, form) => {
            counter++;
            let fieldName = part.name;
            let timestamp = Date.now();
            let ext = part.mimetype?.split("/").pop();
            filename = `${fieldName}-${timestamp}-${counter}.${ext}`;
            return filename;
        },
    })
}


export async function deleteImageInS3(filename: string) {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: filename,
    };

    try {
        await s3.deleteObject(params).promise();
    } catch (err) {
        console.error(`Error deleting image ${filename}:`, err);
    }
}
