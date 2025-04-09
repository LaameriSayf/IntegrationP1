const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
require("dotenv").config();

const routes = require("./routes/index");
const userRoutes = require("./routes/userRoute");
const profileRoutes = require("./routes/profileRoute");
const cryptoRoutes = require("./routes/crypto");
const compteBanciareRoutes = require("./routes/compteBancaireRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");
const userStatsRoutes = require("./routes/userStats");
const passwordRoutes = require("./routes/passwordRoutes");
const cashflowRoutes = require("./routes/cashflow");
const userRoutes2 = require("./routes/user");
const accountsRoutes = require("./routes/accounts");
const transactionsRoutes = require("./routes/transactions");
const stripeRoutes = require("./routes/stripe");
const authRoute = require("./routes/refresh");
const Transaction = require("./models/Transaction");
const FinancialTransaction = require("./models/FinancialTransaction");
const aiService = require("./services/aiService");
const CoinGeckoService = require("./services/CoinGeckoService");
const notificationRoutes = require("./routes/notificationRoutes");
const approvalRoutes = require("./routes/approvalRoutes");

require("./cron");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "default_secret",
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", routes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/user", userRoutes2);
app.use("/api/userstats", userStatsRoutes);
app.use("/api/password", passwordRoutes);
app.use("/auth", authRoutes);
app.use("/complete-profile", upload.single('image'), authRoutes);
app.use("/stripe", stripeRoutes);
app.use("/transaction", transactionRoutes);
app.use("/crypto", cryptoRoutes);
app.use("/compteBancaire", compteBanciareRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/", cashflowRoutes.router);
app.use("/api/auth", authRoute); 
app.use("/api/approvals", approvalRoutes);
app.use("/api/notifications", notificationRoutes);

require("./controllers/passport");

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.DATABASE_NAME,
    })
    .then(() => {
        console.log(`Connecté à MongoDB Atlas - Base: ${process.env.DATABASE_NAME}`);
        const db = mongoose.connection;
        db.once("open", () => {
            console.log(`Base actuellement utilisée: ${db.name}`);
            const transactionsCollection = db.collection("transactions");
            cashflowRoutes.setTransactionsCollection(transactionsCollection);
            console.log('Collection "transactions" prête');
        });

        const PORT = process.env.PORT || 5001;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
         });
    })
    .catch((err) => console.error("Erreur de connexion MongoDB:", err));

io.on("connection", (socket) => {
    console.log("Client connecté via Socket.IO:", socket.id);
    const emitInitialTransactions = async () => {
        try {
            console.log("Envoi des transactions initiales...");
            const transactions = await FinancialTransaction.find().sort({ date: -1 });
            socket.emit("initialTransactions", transactions);
        } catch (error) {
            console.error("Erreur lors de l'émission des transactions initiales:", error);
        }
    };
    emitInitialTransactions();

    socket.on("disconnect", () => {
        console.log("Client déconnecté:", socket.id);
    });
});

app.set("io", io);

module.exports = { app, io };

