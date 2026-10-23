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

const router = express.Router();

router.post("/", verifyToken, csrfProtection, postOrder);

// fetch orders
router.get("/", verifyToken, fetchOrders);

// fetch orders for users from the dashboard website
// offset pagination (e.g. 20 orders per page)
router.get("/all", verifyToken, fetchSomeOrders);

router.get("/revenue", verifyToken, getOrdersRevenue);
router.get("/revenue/monthly", verifyToken, getMonthlyRevenue);

// orders count for statistical purposes
router.get("/count", verifyToken, getOrdersCount);

export default router;
