import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import checkoutRouter from "./checkout";
import checkoutBullionRouter from "./checkout-bullion";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";
import configRouter from "./config";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(checkoutRouter);
router.use(checkoutBullionRouter);
router.use(adminRouter);
router.use(analyticsRouter);
router.use(configRouter);

export default router;
