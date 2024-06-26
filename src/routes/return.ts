import express from "express";
import { createReturn, getUserReturns } from "../controller/return";
import { authorize } from "../middleware/user";

const router = express.Router();

router.get("/user", authorize(), getUserReturns);
router.post("/", authorize(), createReturn);

export default router;
