import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  addCartItem,
  deleteCartItem,
  deleteEntireCart,
  getCartItems,
  mergeCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", verifyToken, getCartItems);

router.post("/", verifyToken, addCartItem);

// delete a single item
router.delete("/delete-item", verifyToken, deleteCartItem);

// delete the entire cart of the user
router.delete("/delete-cart", verifyToken, deleteEntireCart);

// mainly to merge local storage into cart items in the db
router.post("/merge", verifyToken, mergeCart);

export default router;

// Merge endpoint documentation
/*
- This route is to add the local storage cart items to the existing db cart items
using the user id.
- If quantity is different for the same product in the db and local storage,
use ON CONFLICT to add the quantities.
- UNNEST is used to add multiple records, in this case the local storage cart items, 
in a single query.
*/
