import express from "express";
import {
  createReturn,
  getReturnById,
  getUserReturns,
} from "../controller/return";
import { authorize } from "../middleware/user";

const router = express.Router();

router.get("/user", authorize(), getUserReturns);
router.get("/:id", authorize(), getReturnById);
router.post("/", authorize(), createReturn);

export default router;
