import express from "express";
import {
  deleteProduct,
  getProductByCategoryAndId,
  getProducts,
  getProductsByCategory,
  getProductsBySearchTerm,
  getProductsCount,
  getProductsImages,
  getTopPurchased,
  postProduct,
  updateProduct,
} from "../controllers/productsController.js";
import verifyToken from "../middleware/verifyToken.js";
import { csrfProtection } from "../middleware/csrfProtection.js";

const router = express.Router();

// fetch orders according to a limit and offset that are either present or not
router.get("/", getProducts);

// fetch the 3 top purchased products from the orders data
router.get("/top-purchased", getTopPurchased);

// fetch a product by category and id
router.get("/:category/:productId", getProductByCategoryAndId);

// fetch products by search term
router.post("/search", getProductsBySearchTerm);

router.post("/", verifyToken, csrfProtection, postProduct); // admin

router.get("/images", getProductsImages);

// update an existing product with the product id
router.put("/:productId", verifyToken, csrfProtection, updateProduct);

// delete a product
router.delete("/delete/:productId", verifyToken, csrfProtection, deleteProduct); // admin

// products count for statistical purposes
router.get("/count", verifyToken, getProductsCount); // admin

// fetch products by category
router.get("/:category", getProductsByCategory);

export default router;
