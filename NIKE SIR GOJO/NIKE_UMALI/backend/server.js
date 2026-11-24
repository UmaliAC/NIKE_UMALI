
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);

// Test API
app.get("/api/status", (req, res) => {
    res.status(200).json({
        success: true,
        message: "NIKE Website API is running!"
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`NIKE API running at http://localhost:${PORT}`);
});
