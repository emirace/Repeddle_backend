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
// Like a product
router.post("/:productId/like", authorize(), ProductController.likeProduct);

// Unlike a product
router.post("/:productId/unlike", authorize(), ProductController.unlikeProduct);
router.post(
  "/:productId/comments",
  authorize(),
  ProductController.createComment
);

router.post("/:productId/reviews", authorize(), ProductController.submitReview);
// Like a comment on a product
router.post(
  "/:productId/comments/:commentId/like",
  authorize(),
  ProductController.likeComment
);

// Unlike a comment on a product
router.post(
  "/:productId/comments/:commentId/unlike",
  authorize(),
  ProductController.unlikeComment
);
// Reply to a comment on a product
router.post(
  "/:productId/comments/:commentId/reply",
  authorize(),
  ProductController.replyToComment
);
// Like a reply to a comment on a product
router.post(
  "/:productId/comments/:commentId/replies/:replyId/like",
  authorize(),
  ProductController.likeReply
);

// Unlike a reply to a comment on a product
router.post(
  "/:productId/comments/:commentId/replies/:replyId/unlike",
  authorize(),
  ProductController.unlikeReply
);

router.put("/:id", authorize(), ProductController.updateProduct);
router.delete("/:id", authorize(), ProductController.deleteProduct);

export default router;
