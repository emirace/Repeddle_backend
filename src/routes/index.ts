import express from "express";
import user from "./user";
import product from "./product";
import category from "./category";
import message from "./message";
import wallet from "./wallet";
import article from "./article";
import order from "./order";

const router = express.Router();

router.use("/users", user);

router.use("/products", product);

router.use("/articles", article);

router.use("/categories", category);

router.use("/messages", message);

router.use("/wallets", wallet);

router.use("/orders", order);

export default router;
