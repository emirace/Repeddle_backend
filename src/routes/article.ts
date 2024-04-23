// routes/articles.ts

import express from 'express';
import {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getAllDistinctCategories,
  getArticlesByCategory,
} from '../controller/article';
import { authorize } from '../middleware/user';

const router = express.Router();

router.post('/', authorize(['Admin']), createArticle);
router.get('/', getAllArticles);
router.get('/categories', getAllDistinctCategories);
router.get('/:id', getArticleById);
router.put('/:id', authorize(['Admin']), updateArticle);
router.delete('/:id', authorize(['Admin']), deleteArticle);
router.get('/category/:category', getArticlesByCategory);

export default router;
