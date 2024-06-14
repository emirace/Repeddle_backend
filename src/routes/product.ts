import express from "express";
import ProductController from "../controller/product";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

// Apply the extractUserRegion middleware to all product routes
router.use(extractUserRegion);

router.get("/", ProductController.getAllProducts);
router.get("/user", authorize(), ProductController.getAllUserProducts);
router.get("/summary", authorize(), ProductController.getUserProductSummary);
router.get("/:slug", ProductController.getProductBySlug);
router.get("/product/:id", authorize(), ProductController.getProductById);
router.post("/", authorize(), ProductController.createProduct);
router.post(
  "/:productId/comments",
  authorize(),
  ProductController.createComment
);
router.put("/:id", authorize(), ProductController.updateProduct);
router.delete("/:id", authorize(), ProductController.deleteProduct);

export default router;
