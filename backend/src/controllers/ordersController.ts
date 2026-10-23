import { AuthenticatedRequest } from "../middleware/verifyToken.js";
import { Order } from "../types/order.js";
import { Request, Response } from "express";
import pool from "../lib/db.js";
import format from "pg-format";

export const postOrder = async (req: AuthenticatedRequest, res: Response) => {
  const order: Order = req.body;

  if (!order) {
    return res
      .status(400)
      .json({ success: false, error: "Order data is undefined." });
  }

  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(500)
      .json({ success: true, error: "User data couldn't be found." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderMetadataQueryText = `
        INSERT INTO orders (user_id, full_name, email, phone, shipping_method, city, country, state, zipcode, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
        `;
    const orderMetadataQueryParameters = [
      userId,
      order.full_name,
      order.email,
      order.phone,
      order.shipping_method,
      order.city,
      order.country,
      order.state,
      order.zipcode,
      order.total,
    ];

    const queryResult = await client.query(
      orderMetadataQueryText,
      orderMetadataQueryParameters,
    );
    const orderId = queryResult.rows[0].id;

    // insert multiple order items in a single query
    const orderItemsRows = order.items.map((item) => [
      item.id,
      orderId,
      item.quantity,
    ]);
    const orderItemsQuery = format(
      `
            INSERT INTO order_items (product_id, order_id, quantity)
            VALUES %L
        `,
      orderItemsRows,
    );

    await client.query(orderItemsQuery);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Order placed successfully.",
      orderId: orderId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error inserting order into the db:", error);
    res
      .status(500)
      .json({ success: true, error: `Error saving the order to the db.` });
  } finally {
    client.release();
  }
};

export const fetchOrders = async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();

  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(500)
      .json({ success: true, error: "User data couldn't be found." });
  }

  try {
    // order
    const queryText = `
            WITH product_details AS (
              SELECT 
                p.id, 
                p.title, 
                p.price, 
                p.discount_percentage, 
                p.description, 
                p.slug, 
                p.creation_at, 
                p.updated_at, 
                json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'image', c.image) 
                AS category,
                COALESCE(
                  json_agg(json_build_object('url', pi.image)) FILTER (WHERE pi.image_id IS NOT NULL), 
                  '[]'::json
                ) AS images
              FROM products p
              LEFT JOIN product_images pi ON p.id = pi.product_id
              LEFT JOIN categories c ON p.category_id = c.id 
              GROUP BY p.id, c.id
            )
            SELECT  o.id, 
                    o.date, 
                    o.full_name, 
                    o.email, 
                    o.phone, 
                    o.shipping_method, 
                    o.city, 
                    o.country, 
                    o.state, 
                    o.zipcode, 
                    o.total,
                    o.created_at,
                    COALESCE(
                      json_agg(
                        json_build_object(
                          'id', pd.id,
                          'title', pd.title,
                          'price', pd.price,
                          'discount_percentage', pd.discount_percentage,
                          'description', pd.description,
                          'slug', pd.slug,
                          'creation_at', pd.creation_at,
                          'updated_at', pd.updated_at,
                          'category', pd.category,
                          'images', pd.images,
                          'quantity', oi.quantity
                        )
                      )
                      FILTER (WHERE oi.id IS NOT NULL),
                    '[]'::json
                    ) AS items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN product_details pd ON oi.product_id = pd.id 
            WHERE o.user_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;

    const queryResult = await client.query(queryText, [userId]);

    const orders: Order[] = queryResult.rows;

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: "Unable to fetch orders from the database.",
    });
  } finally {
    client.release();
  }
};

export const fetchSomeOrders = async (req: Request, res: Response) => {
  const pageNumber = parseInt(req.query.page as string);
  const pageSize = parseInt(req.query.size as string);

  if (!req.query.page || !pageSize)
    return res
      .status(400)
      .json({ success: false, error: "Missing query params." });

  const client = await pool.connect();

  try {
    const offset = (pageNumber - 1) * pageSize;

    // order
    const queryText = `
            WITH product_details AS (
              SELECT 
                p.id, 
                p.title, 
                p.price, 
                p.discount_percentage, 
                p.description, 
                p.slug, 
                p.creation_at, 
                p.updated_at, 
                json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'image', c.image) 
                AS category,
                COALESCE(
                  json_agg(json_build_object('url', pi.image)) FILTER (WHERE pi.image_id IS NOT NULL), 
                  '[]'::json
                ) AS images
              FROM products p
              LEFT JOIN product_images pi ON p.id = pi.product_id
              LEFT JOIN categories c ON p.category_id = c.id 
              GROUP BY p.id, c.id
            )
            SELECT  o.id, 
                    o.user_id,
                    o.date, 
                    o.full_name, 
                    o.email, 
                    o.phone, 
                    o.shipping_method, 
                    o.city, 
                    o.country, 
                    o.state, 
                    o.zipcode, 
                    o.total,
                    o.created_at,
                    COALESCE(
                      json_agg(
                        json_build_object(
                          'id', pd.id,
                          'title', pd.title,
                          'price', pd.price,
                          'discount_percentage', pd.discount_percentage,
                          'description', pd.description,
                          'slug', pd.slug,
                          'creation_at', pd.creation_at,
                          'updated_at', pd.updated_at,
                          'category', pd.category,
                          'images', pd.images,
                          'quantity', oi.quantity
                        )
                      )
                      FILTER (WHERE oi.id IS NOT NULL),
                    '[]'::json
                    ) AS items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN product_details pd ON oi.product_id = pd.id 
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT $1 OFFSET $2
        `;

    const queryResult = await client.query(queryText, [pageSize, offset]);

    const orders: Order[] = queryResult.rows;

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: "Unable to fetch orders from the database.",
    });
  } finally {
    client.release();
  }
};

export const getOrdersRevenue = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    // orders revenue
    const queryResult = await client.query(
      `SELECT SUM(total) AS revenue FROM orders`,
    );

    const revenue: number = queryResult.rows[0].revenue;

    res.status(200).json({
      success: true,
      message: "Revenue returned successfully.",
      revenue,
    });
  } catch (error) {
    console.error("Error returning revenue:", error);
    res.status(500).json({
      success: false,
      error: "Unable to fetch revenue from the database.",
    });
  } finally {
    client.release();
  }
};

export const getMonthlyRevenue = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const queryResult = await client.query(
      `
        WITH month_series AS (
  	      -- 1. Dynamically generate a series starting 5 months ago up until the current month
	        SELECT 
            generate_series(
		          date_trunc('month', now() - interval '5 months'),
		          date_trunc('month', now()),
		          '1 month'::interval
	          )::date AS month_date
        )
        SELECT 
          -- 2. Format the generated month dates (e.g., "May", "Jun", "Jul")
	        to_char(ms.month_date, 'Mon') as month, coalesce(sum(o.total), 0) as revenue
        FROM month_series ms
        LEFT JOIN orders o ON date_trunc('month', o.created_at) = ms.month_date
        GROUP BY ms.month_date
        ORDER BY ms.month_date asc`,
      [],
    );

    const data = queryResult.rows;

    res.status(200).json({
      success: true,
      message: "Monthly revenue fetched successfully.",
      monthlyRevenue: data,
    });
  } catch (error) {
    console.error("Error returning monthly revenue:", error);
    res.status(500).json({
      success: false,
      error: "Unable to fetch monthly revenue.",
    });
  } finally {
    client.release();
  }
};

export const getOrdersCount = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    // orders count
    const queryResult = await client.query(
      `SELECT COUNT(id) AS count FROM orders`,
    );

    const count: number = queryResult.rows[0].count;

    res.status(200).json({
      success: true,
      message: "Orders count returned successfully.",
      count,
    });
  } catch (error) {
    console.error("Error returning orders count:", error);
    res.status(500).json({
      success: false,
      error: "Unable to fetch orders count from the database.",
    });
  } finally {
    client.release();
  }
};
