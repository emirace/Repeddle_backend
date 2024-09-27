import express from "express";
import {
  createNewsletter,
  deleteNewsletter,
  deleteUserNewsletter,
  getAllNewsletters,
} from "../controller/newaletter";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

router.get("/", authorize(["Admin"]), getAllNewsletters);
router.post("/", extractUserRegion, createNewsletter);
router.delete(
  "/unsubscribe",
  authorize(["User", "Admin"]),
  deleteUserNewsletter
);
router.delete("/:id", authorize(["User", "Admin"]), deleteNewsletter);

export default router;
