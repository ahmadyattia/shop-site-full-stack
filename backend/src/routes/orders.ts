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

const router = express.Router();

router.post("/", verifyToken, postOrder);

// fetch orders
router.get("/", verifyToken, fetchOrders);

// fetch orders for users from the dashboard website
// offset pagination (e.g. 20 orders per page)
router.get("/all", fetchSomeOrders);

router.get("/revenue", getOrdersRevenue);
router.get("/revenue/monthly", getMonthlyRevenue);

// orders count for statistical purposes
router.get("/count", getOrdersCount);

export default router;
