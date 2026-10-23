import { Response } from "express";
import pool from "../lib/db.js";
import { AuthenticatedRequest } from "../middleware/verifyToken.js";
import { CartProduct } from "../types/product.js";

export const getCartItems = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const client = await pool.connect();

  try {
    const queryResult = await client.query(
      `
        SELECT 
            p.id, 
	        p.title, 
	        p.price, 
	        p.discount_percentage, 
	        p.description, 
	        p.slug, 
	        p.creation_at, 
	        p.updated_at, 
	        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'image', c.image) AS category, 
            COALESCE(img.images_json, '[]'::json) AS images,
            ci.quantity
        FROM cart_items ci 
        JOIN products p 
        ON ci.product_id = p.id
        JOIN categories c
        ON p.category_id = c.id
        -- Use a Lateral subquery to aggregate images for each single product row
        LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object('url', pi.image)) AS images_json
        FROM product_images pi
        WHERE pi.product_id = p.id
        ) img ON true
        WHERE ci.user_id = $1
        ORDER BY ci.added_at DESC
        `,
      [req.user?.id],
    );

    const cart_items: CartProduct[] = queryResult.rows;

    res.status(200).json({ success: true, cart_items });
  } catch (error) {
    res.status(500).json({ success: false, error });
  } finally {
    client.release();
  }
};

export const addCartItem = async (req: AuthenticatedRequest, res: Response) => {
  const { product, quantity } = req.body;

  const client = await pool.connect();

  try {
    const queryResult = await client.query(
      `INSERT INTO cart_items VALUES ($1, $2, $3)
        ON CONFLICT (user_id, product_id) 
        DO UPDATE SET quantity = EXCLUDED.quantity`,
      [req.user?.id, product.id, quantity],
    );

    res.status(200).json({ success: true, message: "Item added to cart." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to add item to the cart" });
  } finally {
    client.release();
  }
};

export const deleteCartItem = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const product = req.body;

  const client = await pool.connect();

  try {
    const queryResult = await client.query(
      `DELETE FROM cart_items 
            WHERE user_id = $1 
            AND product_id = $2`,
      [req.user?.id, product.id],
    );

    res.status(200).json({ success: true, message: "Item deleted from cart." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to delete item from cart." });
    console.error("Failed to delete item from cart:", error);
  } finally {
    client.release();
  }
};

export const deleteEntireCart = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const client = await pool.connect();

  try {
    const queryResult = await client.query(
      `DELETE FROM cart_items 
            WHERE user_id = $1 
        `,
      [req.user?.id],
    );

    res
      .status(200)
      .json({ success: true, message: "Cart deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete cart." });
    console.error("Failed to delete cart:", error);
  } finally {
    client.release();
  }
};

export const mergeCart = async (req: AuthenticatedRequest, res: Response) => {
  const guestCartItems: CartProduct[] = req.body;

  const client = await pool.connect();

  try {
    // 1. Map your data into flat, type-safe arrays
    const productIds = guestCartItems.map((item) => item.id);
    const quantities = guestCartItems.map((item) => item.quantity);

    // 2. Pass them directly to this super clean query
    const query = `
        INSERT INTO cart_items (user_id, product_id, quantity)
        SELECT $1::uuid, * FROM UNNEST( $2::uuid[], $3::int[])
        ON CONFLICT (user_id, product_id) 
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity;
        `;

    await client.query(query, [req.user?.id, productIds, quantities]);

    res.status(200).json({ success: true, message: "Items added to cart." });
  } catch (error) {
    res.status(500).json({ success: false, error });
  } finally {
    client.release();
  }
};
