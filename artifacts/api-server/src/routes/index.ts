import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import checkoutRouter from "./checkout";
import checkoutBullionRouter from "./checkout-bullion";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";
import configRouter from "./config";
import userAuthRouter from "./user-auth";
import couponsRouter from "./coupons";
import trackingRouter from "./tracking";
import shippingRouter from "./shipping";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(checkoutRouter);
router.use(checkoutBullionRouter);
router.use(adminRouter);
router.use(analyticsRouter);
router.use(configRouter);
router.use(userAuthRouter);
router.use(couponsRouter);
router.use(shippingRouter);
router.use(trackingRouter);

export default router;
