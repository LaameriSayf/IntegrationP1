import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import PrivateRoute from "./components/PrivateRoute";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import BusinessOwnerPage from "./pages/BuisnessOwnerPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import CompteBancaireForm from "./components/CompteBancaire/CompteBancaireForm";
import CompteBancaireTable from "./components/CompteBancaire/CompteBancaireTable";
import CryptoTable from "./components/crypto/CryptoTable";
import "bootstrap/dist/css/bootstrap.min.css";
import AddTransaction from "./components/transaction/AddTransaction";
import TransactionList from "./components/transaction/TransactionList";
import Sidebar from "./components/backofficeDashboard/Sidebar";
import "./App.css";
import ViewProfilePage from "./pages/ViewProfilePage.jsx";
import UsersListPage from "./pages/UsersListPage.jsx";  
import CompleteProfile from "./pages/CompleteProfileLayer.jsx";
import Confirmation from "./pages/ConfirmationLayer.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import VerifyEmail from "./pages/VerifyEmailPage.jsx";
import AccountantDashboardPage from "./pages/AccountantDashboardPage.jsx";
import AuthCallback from './pages/AuthCallbackPage.jsx';
import io from "socket.io-client";
import FinancialManagerPage from "./pages/FinancialManagerPage.jsx";

// Composant qui utilise useNavigate() et contient la logique de navigation vocale et les routes
function MainApp() {
  const userId = "67bde12663b4be3e706162f3";
  const [refresh, setRefresh] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Configuration de la reconnaissance vocale
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (!listening && transcript) {
      handleVoiceCommand(transcript.toLowerCase());
      resetTranscript();
    }
  }, [transcript, listening, resetTranscript]);

  // Fonction de traitement des commandes vocales, avec gestion des variantes
  const handleVoiceCommand = (command) => {
    console.log("Commande vocale reçue :", command);
    
    if (command.includes("accueil") || command.includes("page d'accueil")) {
      navigate("/");
    } else if (command.includes("connexion")) {
      navigate("/sign-in");
    } else if (command.includes("inscription")) {
      navigate("/sign-up");
    } else if (command.includes("tableau de bord") && command.includes("admin")) {
      navigate("/admin-dashboard");
    } else if (
      (command.includes("tableau de bord") && command.includes("business")) ||
      (command.includes("tableau de bord") && command.includes("propriétaire"))
    ) {
      navigate("/business-owner-dashboard");
    } else if (command.includes("compte.") || command.includes("comptes bancaires")||command.includes("compte bancaire")) {
      navigate("/comptes-bancaires");
    } else if (command.includes("crypto")) {
      navigate("/crypto");
    } else if (command.includes("transaction")) {
      navigate("/transactions");
    } else {
      console.log("Commande inconnue !");
    }
  };

  return (
    <div className="app">
     
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        <h3>🗣️ Navigation Vocale</h3>
        <p>{listening ? "🎤 Écoute en cours..." : "🛑 En pause"}</p>
        {/* Boutons pour démarrer et arrêter l'écoute */}
        <button onClick={SpeechRecognition.startListening}>▶️ Démarrer</button>
        <button onClick={SpeechRecognition.stopListening}>⏹️ Arrêter</button>

        <Routes>
          
          <Route path="/" element={<AccessDeniedPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/Financial-manager-dashboard" element={<FinancialManagerPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:userId/:token" element={<ResetPasswordPage />} />
          <Route exact path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/deleteUsers" element={<AdminPanel/>} />
        <Route path="/verify-email" element={<VerifyEmail />} /> {/* Nouvelle route */}


          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={["Admin"]}>
                <AdminDashboardPage />
              </PrivateRoute>
            }
          />
           <Route
            path="/Financial-manager-dashboard"
            element={
              <PrivateRoute allowedRoles={["Financial manager"]}>
                <FinancialManagerPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/business-owner-dashboard"
            element={
              <PrivateRoute allowedRoles={["Business owner"]}>
                <BusinessOwnerPage />
              </PrivateRoute>
            }
          />
            <Route
            path="/accountant-dashboard"
            element={
              <PrivateRoute allowedRoles={["Accountant"]}>
                <AccountantDashboardPage />
              </PrivateRoute>
            }
          />
         

          <Route
            path="/comptes-bancaires"
            element={
              <div>
                <CompteBancaireForm userId={userId} onRefresh={() => setRefresh(!refresh)} />
                <CompteBancaireTable userId={userId} refresh={refresh} onRefresh={() => setRefresh(!refresh)} />
              </div>
            }
          />
          <Route path="/crypto" element={<CryptoTable />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/add-transaction" element={<AddTransaction />} />
          <Route path="/transactions" element={<TransactionList />} />
           <Route exact path='/view-profile' element={<ViewProfilePage />} />
        <Route exact path='/view-users' element={<UsersListPage />} />

        </Routes>
      </div>
    </div>
  );
}

// Composant App qui enveloppe MainApp dans BrowserRouter pour fournir le contexte nécessaire à useNavigate()
function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}

export default App;
