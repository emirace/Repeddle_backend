// routes/categoryRoutes.ts

import express from 'express';
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from '../controller/category';
import { authorize } from '../middleware/user';

const router = express.Router();

router.post('/', authorize(['Admin']), createCategory);
router.get('/', getAllCategories);
router.get('/:id', authorize(['Admin']), getCategoryById);
router.put('/:id', authorize(['Admin']), updateCategory);
router.delete('/:id', authorize(['Admin']), deleteCategory);

export default router;
