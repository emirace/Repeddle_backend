import express from "express";
import {
  addBrand,
  deleteBrand,
  getAllBrands,
  getAllPublishedBrands,
  getBrandsByAlpha,
  updateBrand,
} from "../controller/brand";
import { authorize } from "../middleware/user";

const router = express.Router();

router.get("/", getAllPublishedBrands);

router.get("/admin", authorize(["Admin"]), getAllBrands);

router.get("/:alpha", getBrandsByAlpha);

router.post("/", authorize(["User", "Admin"]), addBrand);

router.put("/:id", authorize(["Admin"]), updateBrand);

router.delete("/:id", authorize(["Admin"]), deleteBrand);

export default router;
