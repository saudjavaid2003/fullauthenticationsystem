import express, { urlencoded } from "express";
import cors from "cors";
import { config } from "dotenv";
import {connect} from "./db/connection.js"

config(); // Load environment variables

const app = express();

app.use(cors({
    origin: ["http://localhost:3000"],  // Fixed typo in 'origin'
    methods: ["GET", "POST", "PUT", "DELETE"],  // Changed 'PUSH' to 'PUT'
    credentials: true  // Fixed typo in 'credentials'
}));

app.use(urlencoded({ extended: true }));
app.use(express.json());
connect()

export default app;
