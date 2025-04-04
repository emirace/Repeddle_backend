import { Request, Response } from "express";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const region = process.env.AWS_BUCKET_REGION || "";
const bucket = process.env.AWS_BUCKET_NAME || "";
// const backendUrl = process.env.BACKEND_URL || '';

const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket,
    key: function (req, file, cb) {
      cb(null, "image" + Date.now() + ".jpg");
    },
  }),
});

export const uploadImage = async (req: Request, res: Response) => {
  try {
    await new Promise<void>((resolve, reject) => {
      upload.single("image")(req, res, function (err: any) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    const { key } = req.file as any;

    const { deleteImage } = req.body;
    if (deleteImage) {
      const deleteKey = deleteImage.substring(deleteImage.lastIndexOf("/") + 1);
      console.log(deleteKey);
      const params = {
        Bucket: bucket,
        Key: deleteKey as string,
      };
      console.log("deleteKey", deleteKey);
      const command = new DeleteObjectCommand(params);
      await s3.send(command);
    }

    const imageUrl = `/api/images/${key}`;
    console.log(imageUrl);
    res.status(200).send({ status: true, imageUrl });
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const downloadImage = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    if (!key) {
      return res.status(404).json({ message: "Image key is required" });
    }
    const params = {
      Bucket: bucket,
      Key: key as string,
    };

    const command = new GetObjectCommand(params);
    const response = await s3.send(command);
    if (!response.Body) {
      return res.status(404).json({ message: "Image not found" });
    }
    const bodyChunks = [];
    const str = await response.Body.transformToByteArray();

    const bodyBuffer = Buffer.from(str);
    res.writeHead(200, {
      "Content-Type": response.ContentType,
      "Content-Length": bodyBuffer.length,
    });
    res.end(bodyBuffer);
  } catch (error) {
    console.error("Image download error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.params;
    if (!image) {
      return res.status(404).json({ message: "Image url is required" });
    }
    const deleteKey = image.substring(image.lastIndexOf("/") + 1);
    const params = {
      Bucket: bucket,
      Key: deleteKey as string,
    };
    console.log("deleteKey", deleteKey);
    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    res.status(200).send({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Image delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
