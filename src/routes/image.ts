import express from "express";
import { authorize } from "../middleware/user";
import { deleteImage, downloadImage, uploadImage } from "../controller/image";

const router = express.Router();

router.post("/", authorize(["User", "Admin"]), uploadImage);

router.get("/:key", downloadImage);

router.delete("/:image", authorize(["User", "Admin"]), deleteImage);

export default router;
