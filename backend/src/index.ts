import express, { Request, Response } from "express";
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import signupRouter from "./routes/auth/signup.js";
import loginRouter from "./routes/auth/login.js";
import meRouter from "./routes/auth/me.js";
import cartRouter from "./routes/cart.js";
import ordersRouter from "./routes/orders.js";
import deleteAccRouter from "./routes/auth/delete-account.js";
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
  allowedHeaders: ["Content-Type", "Authorization"],
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
app.use("/api/auth/signup", signupRouter);
app.use("/api/auth/login", loginRouter);
app.use("/api/auth/me", meRouter);
app.use("/api/auth/delete-account", deleteAccRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, () => {
  console.log(`Server is running happily on port ${PORT}!`);
});
