const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const userRoutes = require('./routes/userRoute');
const profileRoutes = require('./routes/profileRoute');
const cryptoRoutes = require('./routes/crypto');
const compteBanciareRoutes=require('./routes/compteBancaireRoutes')
require('dotenv').config();
const cors = require('cors');
const dbConfig = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;
const transactionRoutes = require('./routes/transactionRoutes');
const FinancialTransaction = require('./models/FinancialTransaction');
const aiService = require('./services/aiService');
const User = require('./models/user');
const Transaction = require('./models/transaction');
const CoinGeckoService=require('./services/CoinGeckoService')

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// Database connection
dbConfig();

// Routes
app.use('/api', routes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes); 
app.use('/api', routes);
app.use('/api/users', userRoutes);
app.use('/stripe', require('./routes/stripe'));
app.use('/transaction', transactionRoutes); // Transaction Routes
app.use('/crypto', cryptoRoutes); // Transaction Routes
app.use('/compteBancaire', compteBanciareRoutes);


// Start the server
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((error) => console.log(error.message));