const mongoose = require("mongoose");
const PendingApproval = require("../models/PendingApproval"); // Ajustez le chemin selon l'emplacement de votre modèle

const seedData = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://halim123:halim123@innodev.xkxu9.mongodb.net/test?retryWrites=true&w=majority&appName=InnoDev" ,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB for seeding.");

    // Supprimer les anciennes données (optionnel, commentez si vous voulez conserver les données existantes)
   // await PendingApproval.deleteMany();

    // Insérer des données de test
    const approvals = [
      {
        userEmail: "ouday.oueslati@esprit.tn",
        approvalType: "transaction",
        details: "Transaction of 500 DT",
        status: "pending",
      },
      {
        userEmail: "ouday.oueslati@esprit.tn",
        approvalType: "transaction",
        details: "Transaction of 1000 DT",
        status: "pending",
      }
      
    ];

    await PendingApproval.insertMany(approvals);
    console.log("Test data inserted successfully.");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();