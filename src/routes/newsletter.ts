import express from "express";
import {
  createNewsletter,
  deleteNewsletter,
  getAllNewsletters,
} from "../controller/newaletter";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

router.get("/", authorize(["Admin"]), getAllNewsletters);
router.post("/", extractUserRegion, createNewsletter);
router.delete("/:id", authorize(), deleteNewsletter);

export default router;
