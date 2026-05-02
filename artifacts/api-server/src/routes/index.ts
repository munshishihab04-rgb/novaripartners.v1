import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import checkoutRouter from "./checkout";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";
import configRouter from "./config";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(checkoutRouter);
router.use(adminRouter);
router.use(analyticsRouter);
router.use(configRouter);

export default router;
