import express from "express";
import ProductController from "../controller/product";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

// Apply the extractUserRegion middleware to all product routes
router.use(extractUserRegion);

router.get("/", ProductController.getAllProducts);
router.get(
  "/user",
  authorize(["User", "Admin"]),
  ProductController.getAllUserProducts
);
router.get(
  "/summary",
  authorize(["User", "Admin"]),
  ProductController.getUserProductSummary
);
router.get("/:slug", ProductController.getProductBySlug);
router.get(
  "/product/:id",
  authorize(["User", "Admin"]),
  ProductController.getProductById
);
router.post("/", authorize(["User", "Admin"]), ProductController.createProduct);
// Like a product
router.post(
  "/:productId/like",
  authorize(["User", "Admin"]),
  ProductController.likeProduct
);

router.patch(
  "/:productId/unavailable",
  ProductController.markProductAsNotAvailable
);

// Unlike a product
router.post(
  "/:productId/unlike",
  authorize(["User", "Admin"]),
  ProductController.unlikeProduct
);
router.post(
  "/:productId/comments",
  authorize(["User", "Admin"]),
  ProductController.createComment
);

router.post(
  "/:productId/reviews",
  authorize(["User", "Admin"]),
  ProductController.submitReview
);

// Route to increase view count
router.post("/:productId/view", ProductController.addViewCount);

// Route to increase share count
router.post("/:productId/share", ProductController.addShareCount);

// Like a comment on a product
router.post(
  "/:productId/comments/:commentId/like",
  authorize(["User", "Admin"]),
  ProductController.likeComment
);

// Unlike a comment on a product
router.post(
  "/:productId/comments/:commentId/unlike",
  authorize(["User", "Admin"]),
  ProductController.unlikeComment
);
// Reply to a comment on a product
router.post(
  "/:productId/comments/:commentId/reply",
  authorize(["User", "Admin"]),
  ProductController.replyToComment
);
// Like a reply to a comment on a product
router.post(
  "/:productId/comments/:commentId/replies/:replyId/like",
  authorize(["User", "Admin"]),
  ProductController.likeReply
);

// Unlike a reply to a comment on a product
router.post(
  "/:productId/comments/:commentId/replies/:replyId/unlike",
  authorize(["User", "Admin"]),
  ProductController.unlikeReply
);

router.put(
  "/:id",
  authorize(["User", "Admin"]),
  ProductController.updateProduct
);
router.delete(
  "/:id",
  authorize(["User", "Admin"]),
  ProductController.deleteProduct
);

export default router;
