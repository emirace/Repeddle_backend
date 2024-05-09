import express from "express";
import {
  addBrand,
  deleteBrand,
  getAllBrands,
  getAllPublishedBrands,
  updateBrand,
} from "../controller/brand";
import { authorize } from "../middleware/user";

const router = express.Router();

router.get("/", getAllPublishedBrands);

router.get("/admin", authorize(["Admin"]), getAllBrands);

router.post("/", authorize(), addBrand);

router.put("/:id", authorize(["Admin"]), updateBrand);

router.delete("/:id", authorize(["Admin"]), deleteBrand);

export default router;
