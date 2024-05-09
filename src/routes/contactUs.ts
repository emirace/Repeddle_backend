import express from "express";
import {
  addContactUs,
  assignContactToUser,
  deleteContact,
  getAllContactUs,
} from "../controller/contactUs";
import { authorize } from "../middleware/user";

const router = express.Router();

router.post("/", addContactUs);
router.get("/", authorize(["Admin"]), getAllContactUs);
router.put("/assign/:contactId", authorize(["Admin"]), assignContactToUser);
router.delete("/:id", authorize(["Admin"]), deleteContact);

export default router;
