import express from 'express';
import ProductController from '../controller/product';
import { authorize, extractUserRegion } from '../middleware/user';

const router = express.Router();

// Apply the extractUserRegion middleware to all product routes
router.use(extractUserRegion);

router.get('/', ProductController.getAllProducts);
router.get('/:slug', ProductController.getProductBySlug); // Use slug instead of ID
router.post('/', authorize(), ProductController.createProduct);
router.put('/:id', authorize(), ProductController.updateProduct);
router.delete('/:id', authorize(), ProductController.deleteProduct);

export default router;
