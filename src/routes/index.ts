import express from 'express';
import user from './user';
import product from './product';
import category from './category';
import message from './message';
import wallet from './wallet';

const router = express.Router();

router.use('/users', user);

router.use('/products', product);

router.use('/categories', category);

router.use('/messages', message);

router.use('/wallets', wallet);

export default router;
