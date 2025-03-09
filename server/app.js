import express, { urlencoded } from "express";
import cors from "cors";
import { config } from "dotenv";
import { connect } from "./db/connection.js";
import { errormiddleware } from "./middleware/error.js";

config(); // Load environment variables

const app = express();

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(urlencoded({ extended: true }));
app.use(express.json())

connect().catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
});

// ✅ Correct usage (no parentheses)
app.use(errormiddleware);

export default app;
