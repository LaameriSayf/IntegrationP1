const express = require('express');
const connectDB = require('./db');
const dotenv = require('dotenv');
const userRoutes = require('../routes/userRoute');
const profileRoutes = require('../routes/profileRoute');
const bodyParser = require('body-parser');
const cors = require("cors");
const upload = require('../middlewares/uploadImage');
require('dotenv').config();

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// Middleware
app.use(express.json());
app.use(express.json({ limit: "5mb" })); // Allow JSON payloads for Base64 images
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
