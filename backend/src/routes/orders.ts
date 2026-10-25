import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  fetchOrders,
  fetchSomeOrders,
  postOrder,
  getOrdersRevenue,
  getOrdersCount,
  getMonthlyRevenue,
} from "../controllers/ordersController.js";
import { csrfProtection } from "../middleware/csrfProtection.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// post an order
router.post("/", verifyToken, csrfProtection, postOrder);

// fetch orders
router.get("/", verifyToken, fetchOrders);

// fetch orders for users from the dashboard website
// offset pagination (e.g. 20 orders per page)
router.get("/all", verifyToken, isAdmin, fetchSomeOrders); // admin

router.get("/revenue", verifyToken, isAdmin, getOrdersRevenue); // admin
router.get("/revenue/monthly", verifyToken, isAdmin, getMonthlyRevenue); // admin

// orders count
router.get("/count", verifyToken, isAdmin, getOrdersCount); // admin

export default router;
