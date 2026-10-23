import express, { Request, Response } from "express";
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import authRouter from "./routes/auth.js";
import cartRouter from "./routes/cart.js";
import ordersRouter from "./routes/orders.js";
import usersRouter from "./routes/users.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins: string[] = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
].filter((url): url is string => !!url); // Type guard removes 'undefined'

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-TOKEN"],
};

app.use(cors(corsOptions));

// Increase JSON and URL-encoded limits (e.g., to 10 Megabytes)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

app.get("/health", (req: Request, res: Response) => {
  res.json("Server is running!");
});

app.get("/run-script", () => {});

app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, () => {
  console.log(`Server is running happily on port ${PORT}!`);
});
