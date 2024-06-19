import express from "express";
import user from "./user";
import product from "./product";
import category from "./category";
import message from "./message";
import wallet from "./wallet";
import article from "./article";
import brand from "./brand";
import order from "./order";
import contactUs from "./contactUs";
import newsletter from "./newsletter";
import transaction from "./transaction";
import image from "./image";
import notification from "./notification";

const router = express.Router();

router.use("/users", user);

router.use("/products", product);

router.use("/articles", article);

router.use("/categories", category);

router.use("/messages", message);

router.use("/wallets", wallet);

router.use("/orders", order);

router.use("/brands", brand);

router.use("/contactus", contactUs);

router.use("/newsletters", newsletter);

router.use("/transactions", transaction);

router.use("/images", image);

router.use("/notifications", notification);

export default router;
