import { Request, Response } from "express";
import pool from "../lib/db.js";
import { Product, ProductWithSales } from "../types/product.js";
import insertProduct from "../services/insertProduct.js";
import format from "pg-format";

export const getProducts = async (req: Request, res: Response) => {
  let pageNumber = req.query.page !== undefined ? req.query.page : null;
  let pageSize = req.query.size !== undefined ? req.query.size : null;

  let offset =
    pageNumber && pageSize
      ? (parseInt(pageNumber as string) - 1) * parseInt(pageSize as string)
      : null;

  const client = await pool.connect();

  try {
    // using postgreSQL functions
    // to aggregate images into a single array of objects
    // also with categories to save them as a json object
    const queryResult = await client.query(
      `
        SELECT p.id, 
	    p.title, 
	    p.price, 
	    p.discount_percentage, 
	    p.description, 
	    p.slug, 
	    p.creation_at, 
	    p.updated_at, 
	    json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'image', c.image) AS category, 
        COALESCE(
            json_agg(
            json_build_object('url', pi.image)
            ) FILTER (WHERE pi.image_id IS NOT NULL), 
            '[]'::json
        ) AS images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        LEFT JOIN categories c ON p.category_id = c.id 
        GROUP BY p.id, c.id
        ORDER BY p.updated_at DESC
        LIMIT $1 OFFSET $2
        `,
      [pageSize, offset],
    );

    const products: Product[] = queryResult.rows;

    res.status(200).json({
      success: true,
      message: "Products fetched successfully!",
      products: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: error });
  } finally {
    client.release();
  }
};

export const getTopPurchased = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const queryResult = await client.query(
      `
      select 
		  p.id, 
	    p.title, 
	    p.price, 
	    p.discount_percentage, 
	    p.description, 
	    p.slug, 
	    p.creation_at, 
      p.updated_at,
      COALESCE(
    	  json_agg(json_build_object('url', pi.image))
    	  FILTER (WHERE pi.image_id IS NOT NULL), '[]'::json) AS images, 
      json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'image', c.image) as category,
      sales.total_purchased
    from products p
    left join (
	    select product_id, sum(quantity) as total_purchased
	    from order_items
	    group by product_id
    ) sales on p.id = sales.product_id 
    left join categories c on p.category_id = c.id
    left join product_images pi on p.id = pi.product_id 
    group by p.id, sales.total_purchased, c.id
    order by sales.total_purchased desc nulls last
    limit 3
    `,
    );

    const topThreeProducts: ProductWithSales[] = queryResult.rows;

    res.status(200).json({
      success: true,
      message: "Fetched the top products successfully!",
      products: topThreeProducts,
    });
  } catch (error) {
    console.error("Error fetching top products:", error);
    res
      .status(500)
      .json({ success: false, error: "Error fetching top products" });
  } finally {
    client.release();
  }
};

export const getProductByCategoryAndId = async (
  req: Request,
  res: Response,
) => {
  const client = await pool.connect();
  const { productId } = req.params;

  try {
    // using postgreSQL functions
    // to aggregate images into a single array of objects
    // also with categories to save them as a json object
    const queryResult = await client.query(
      `
        SELECT p.id, 
	    p.title, 
	    p.price, 
	    p.discount_percentage, 
	    p.description, 
	    p.slug, 
	    p.creation_at, 
	    p.updated_at, 
	    json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'image', c.image) AS category, 
        COALESCE(
            json_agg(
            json_build_object('url', pi.image)
            ) FILTER (WHERE pi.image_id IS NOT NULL), 
            '[]'::json
        ) AS images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = $1
        GROUP BY p.id, c.id;
        `,
      [productId],
    );

    const product: Product = queryResult.rows[0];

    res.status(200).json({ success: true, product: product });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: error });
  } finally {
    client.release();
  }
};

export const getProductsBySearchTerm = async (req: Request, res: Response) => {
  const { debouncedSearchTerm } = req.body;
  const client = await pool.connect();

  try {
    // using postgreSQL functions
    // to aggregate images into a single array of objects
    // also with categories to save them as a json object
    const queryResult = await client.query(
      `
        SELECT p.id, 
	    p.title, 
	    p.price, 
	    p.discount_percentage, 
	    p.description, 
	    p.slug, 
	    p.creation_at, 
	    p.updated_at, 
	    json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'image', c.image) AS category, 
        COALESCE(
            json_agg(
            json_build_object('url', pi.image)
            ) FILTER (WHERE pi.image_id IS NOT NULL), 
            '[]'::json
        ) AS images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.title ILIKE $1
        GROUP BY p.id, c.id;
        `,
      [`%${debouncedSearchTerm}%`],
    );

    const products: Product[] = queryResult.rows;

    res.status(200).json({ success: true, products: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: error });
  } finally {
    client.release();
  }
};

export const postProduct = async (req: Request, res: Response) => {
  const product = req.body;

  try {
    await insertProduct(product);

    res.status(200).json({ success: true, product: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
};

export const getProductsImages = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const queryResult = await client.query("SELECT * FROM product_images");
    const images = queryResult.rows;

    res.status(200).json({ success: true, images: images });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  } finally {
    client.release();
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const product: Product = req.body;

  if (!productId)
    return res
      .status(400)
      .json({ success: false, error: "Missing product id param." });
  if (!product)
    return res
      .status(400)
      .json({ success: false, error: "Missing product data." });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const categoryIdQueryResult = await client.query(
      "SELECT id FROM categories WHERE name = $1",
      [product.category.name],
    );

    const categoryId = categoryIdQueryResult.rows[0].id;

    await client.query(
      `
      UPDATE products
      SET 
        title = $1,
        category_id = $2,
        price = $3,
        discount_percentage = $4,
        description = $5,
        slug = $6
      WHERE 
        id = $7
    `,
      [
        product.title,
        categoryId,
        product.price,
        product.discountPercentage,
        product.description,
        product.slug,
        product.id,
      ],
    );

    // Wipe out all existing images associated with the product
    await client.query(
      `
    DELETE FROM product_images 
    WHERE product_id = $1;
    `,
      [productId],
    );

    const imageRows = product.images.map((image) => [productId, image.url]);

    // Insert brand new set of images
    const imagesQuery = format(
      "INSERT INTO product_images (product_id, image) VALUES %L;",
      imageRows,
    );

    await client.query(imagesQuery);

    await client.query("COMMIT");

    return res
      .status(200)
      .json({ success: true, message: "Product data updated successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to update product data:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to update product data" });
  } finally {
    client.release();
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;

  const client = await pool.connect();

  try {
    await client.query(`DELETE FROM products WHERE id = $1`, [productId]);

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product." });
    console.error(error);
  } finally {
    client.release();
  }
};

export const getProductsCount = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    // products count
    const queryResult = await client.query(
      `SELECT COUNT(id) AS count FROM products`,
    );

    const count: number = queryResult.rows[0].count;

    res.status(200).json({
      success: true,
      message: "Products count returned successfully.",
      count,
    });
  } catch (error) {
    console.error("Error returning products count:", error);
    res.status(500).json({
      success: false,
      error: "Unable to fetch products count from the database.",
    });
  } finally {
    client.release();
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  const client = await pool.connect();
  const { category } = req.params;

  try {
    // using postgreSQL functions
    // to aggregate images into a single array of objects
    // also with categories to save them as a json object
    const queryResult = await client.query(
      `
        SELECT p.id, 
	    p.title, 
	    p.price, 
	    p.discount_percentage, 
	    p.description, 
	    p.slug, 
	    p.creation_at, 
	    p.updated_at, 
	    json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'image', c.image) AS category, 
        COALESCE(
            json_agg(
            json_build_object('url', pi.image)
            ) FILTER (WHERE pi.image_id IS NOT NULL), 
            '[]'::json
        ) AS images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE c.slug = $1
        GROUP BY p.id, c.id;
        `,
      [category],
    );

    const products: Product[] = queryResult.rows;

    res.status(200).json({
      success: true,
      message: "Products according to category fetched successfully!",
      products: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: error });
  } finally {
    client.release();
  }
};
